import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, readFile, writeFile, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createServerMenuCache } from '../src/lib/serverMenuCache.mjs';
import crypto from 'node:crypto';
const folders = [];
const originalFetch = globalThis.fetch, originalNow = Date.now;
afterEach(async () => {
  globalThis.fetch = originalFetch; Date.now = originalNow;
  await Promise.all(folders.splice(0).map(folder => rm(folder, { recursive: true, force: true })));
});
async function server(load, key = 'main') {
  const directory = await mkdtemp(path.join(tmpdir(), 'tmmob-menu-test-')); folders.push(directory);
  return { cache: createServerMenuCache({ key, load, directory, ttlMs: 300_000 }), directory };
}
let serial = 0;
async function client() {
  const source = await readFile(new URL('../src/lib/clientMenuCache.mjs', import.meta.url), 'utf8');
  return import(`data:text/javascript;base64,${Buffer.from(source+'\n//'+serial++).toString('base64')}`);
}
const data = label => ({ slug: 'menu', items: [{ name: label }] });
const response = items => ({ ok: true, json: async () => ({ success: true, items }) });

test('server cache shares disk entries across bundle instances and deduplicates simultaneous loads', async () => {
  let calls=0;
  const load=async()=>{ calls++; await new Promise(r=>setTimeout(r,5)); return data('first'); };
  const {cache,directory}=await server(load);
  const other=createServerMenuCache({key:'main',directory,load,ttlMs:300_000});
  assert.deepEqual(await Promise.all([cache.get(),other.get(),cache.get()]),[data('first'),data('first'),data('first')]);
  assert.equal(calls,1);
  const restarted=createServerMenuCache({key:'main',directory,ttlMs:300_000,load:()=>{throw Error('disk must be reused');}});
  assert.deepEqual(await restarted.get(),data('first'));
});
test('webhook invalidation in another bundle is visible immediately and clears intentional empty menus', async () => {
  let items=data('first'),calls=0;
  const load=async()=>{calls++;return items;};
  const {cache,directory}=await server(load);
  await cache.get();
  const webhook=createServerMenuCache({key:'main',directory,load,ttlMs:300_000});
  items={slug:'menu',items:[]}; await webhook.invalidate();
  assert.deepEqual(await cache.get(),items);assert.equal(calls,2);
});
test('in-flight pre-webhook data cannot restore a removed menu', async () => {
  let resolve, started;const ready=new Promise(r=>started=r);let calls=0;
  const {cache}=await server(async()=>{
    calls++; if(calls===1){started();return new Promise(r=>resolve=r);} return {slug:'menu',items:[]};
  });
  const pending=cache.get();await ready;await cache.invalidate();
  assert.deepEqual(await cache.get(),{slug:'menu',items:[]});
  resolve(data('removed'));assert.deepEqual(await pending,{slug:'menu',items:[]});
  assert.deepEqual(await cache.get(),{slug:'menu',items:[]});assert.equal(calls,2);
});
test('server TTL expires, failures keep last good data with bounded retry, invalidation never restores stale data', async () => {
  let now=100000,calls=0,fail=false;Date.now=()=>now;
  const {cache}=await server(async()=>{calls++;return fail?null:data('good');});
  await cache.get();now+=300001;fail=true;
  assert.deepEqual(await cache.get(),data('good'));assert.equal(calls,2);
  await cache.get();assert.equal(calls,2);
  await cache.invalidate();assert.equal(await cache.get(),null);assert.equal(calls,3);
  await cache.get();assert.equal(calls,3);
  now+=30001;fail=false;assert.deepEqual(await cache.get(),data('good'));assert.equal(calls,4);
});
test('corrupt cache files are repaired and separate menu keys remain isolated', async () => {
  const {cache,directory}=await server(async()=>data('main'));
  await cache.get();const file=(await readdir(directory)).find(f=>f.endsWith('.json'));
  await writeFile(path.join(directory,file),'broken');assert.deepEqual(await cache.get(),data('main'));
  const right=createServerMenuCache({key:'right',directory,load:async()=>data('right'),ttlMs:300000});
  assert.deepEqual(await right.get(),data('right'));await right.invalidate();assert.deepEqual(await cache.get(),data('main'));
});
test('oversized menu data cannot grow the disk cache beyond the per-entry bound', async () => {
  const { cache, directory } = await server(async () => ({ items: [{ name: 'x'.repeat(512 * 1024) }] }));
  await assert.rejects(() => cache.get(), /size limit/);
  assert.deepEqual(await readdir(directory), []);
});
test('homepage seeds eliminate menu requests on detail navigation and empty arrays are authoritative', async () => {
  const c=await client();c.seedClientMenu('main',[{name:'CMS'}]);c.seedClientMenu('right',[]);
  globalThis.fetch=()=>{throw Error('must not request');};
  for(let i=0;i<5;i++){
    assert.deepEqual(await c.getClientMenu('main'),[{name:'CMS'}]);assert.deepEqual(await c.getClientMenu('right'),[]);
  }
});
test('client fetches once per menu, deduplicates remounts and refreshes only after bounded TTL', async () => {
  const c=await client();let calls=0,now=100000;Date.now=()=>now;
  globalThis.fetch=async(url,options)=>{calls++;assert.equal(options.cache,'no-store');return response([{name:url}]);};
  await Promise.all([c.getClientMenu('main'),c.getClientMenu('main')]);assert.equal(calls,1);
  now+=59000;await c.getClientMenu('main');assert.equal(calls,1);
  now+=1001;await c.getClientMenu('main');assert.equal(calls,2);
  await c.getClientMenu('right');assert.equal(calls,3);
});
test('new SSR props supersede in-flight old responses and notify all mounted menus', async () => {
  const c=await client();let resolve,updates=0;
  const unsubscribe=c.subscribeMenu('main',()=>updates++);
  globalThis.fetch=()=>new Promise(r=>resolve=r);
  const pending=c.getClientMenu('main');c.seedClientMenu('main',[]);
  resolve(response([{name:'old'}]));assert.deepEqual(await pending,[]);assert.equal(updates,1);
  unsubscribe();c.seedClientMenu('main',[]);assert.equal(updates,1);
});
test('client errors never cache an empty fallback and retries do not hammer the endpoint', async () => {
  const c=await client();let now=100000,calls=0;Date.now=()=>now;
  globalThis.fetch=async()=>{calls++;return {ok:false};};
  assert.equal(await c.getClientMenu('right'),null);await c.getClientMenu('right');assert.equal(calls,1);
  now+=10001;globalThis.fetch=async()=>{calls++;return response([]);};
  assert.deepEqual(await c.getClientMenu('right'),[]);assert.equal(calls,2);
});

async function handler(file, refresh) {
  const source=await readFile(new URL(file,import.meta.url),'utf8');
  const sig=await readFile(new URL('../src/lib/webhookSignature.js',import.meta.url),'utf8');
  const {verifySignature}=await import(`data:text/javascript;base64,${Buffer.from(sig).toString('base64')}`);
  return new Function('refreshMenuCaches','verifySignature','invalidateServerSettingsCache','return ('+source.replace(/^import .*;\n/gm,'').replace('export default ','').trim()+')')(refresh,verifySignature,()=>{});
}
for(const file of ['../src/pages/api/webhooks.js','../src/pages/api/webhook/settings.js']){
 test(file+' authenticates menu invalidation and propagates refresh failures for retry',async()=>{
  const old=process.env.WEBHOOK_SECRET;process.env.WEBHOOK_SECRET='menu-test-only';
  try{
   let refreshed=0,status;const body={menu:{slug:'ana-menu'}};
   const signature=crypto.createHmac('sha256',process.env.WEBHOOK_SECRET).update(JSON.stringify(body)).digest('hex');
   const res={setHeader(){},status(n){status=n;return this;},json(x){return x;}};
   const run=await handler(file,async()=>{refreshed++;});
   const req={method:'POST',body,headers:{'x-cms-event':'menu.updated'}};
   await run(req,res);assert.equal(status,401);assert.equal(refreshed,0);
   req.headers['x-cms-signature']=signature;await run(req,res);assert.equal(status,200);assert.equal(refreshed,1);
   const failing=await handler(file,async()=>{throw Error('offline');});await failing(req,res);assert.equal(status,500);
  }finally{if(old===undefined)delete process.env.WEBHOOK_SECRET;else process.env.WEBHOOK_SECRET=old;}
 });
}
test('menu webhook warms both shared caches before awaiting ISR homepage regeneration',async()=>{
 const source=await readFile(new URL('../src/lib/refreshMenus.js',import.meta.url),'utf8');
 const sequence=[];
 const factory=new Function('getServerMainMenu','getServerRightMenu','invalidateServerMainMenuCache','invalidateServerRightMenuCache',source.replace(/^import .*;\n/gm,'').replace('export async function','async function')+';return refreshMenuCaches;');
 const refresh=factory(async()=>{sequence.push('main');return data('main');},async()=>{sequence.push('right');return data('right');},async()=>{sequence.push('invalidate-main');},async()=>{sequence.push('invalidate-right');});
 await refresh({revalidate:async p=>{assert.equal(p,'/');assert.equal(sequence.length,4);sequence.push('page');}});
 assert.equal(sequence.at(-1),'page');
 const failed=factory(async()=>null,async()=>data('right'),async()=>{},async()=>{});
 await assert.rejects(()=>failed({revalidate:()=>{throw Error('must not regenerate stale page');}}),/Menu refresh failed/);
});
