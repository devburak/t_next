import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { xml, absoluteUrl, renderRss, renderSitemap, renderSitemapIndex, sitemapParts } from '../src/lib/discoveryXml.mjs';
import { createServerMenuCache } from '../src/lib/serverMenuCache.mjs';
const site='https://tmmob.org.tr',originalFetch=globalThis.fetch;
afterEach(()=>{globalThis.fetch=originalFetch;});
const row={_id:'1',slug:'haber',title:'TMMOB & Odalar <Örnek>',publishDate:'2026-01-01T12:00:00Z',spot:'<b>Deneme</b> & açıklama'};
test('RSS 2 uses escaped Turkish text, canonical links, stable GUIDs and RFC dates',()=>{
 const rss=renderRss(site,{items:[row],title:'TMMOB',feedPath:'/rss.xml'});
 assert(rss.includes('TMMOB &amp; Odalar &lt;Örnek&gt;'));assert(rss.includes('<guid isPermaLink="false">urn:tmmob:content:1</guid>'));
 assert(rss.includes('Thu, 01 Jan 2026 12:00:00 GMT'));assert(rss.includes('https://tmmob.org.tr/haber'));
 assert(!rss.includes('<b>'));assert(rss.includes('application/rss+xml'));assert(!xml('\u0000').length);
 const temporary=renderRss('https://temporary.example',{items:[row],title:'TMMOB',feedPath:'/rss.xml'});
 assert(temporary.includes('urn:tmmob:content:1'));assert(temporary.includes('https://temporary.example/haber'));
});
test('RSS omits drafts, future entries and invalid dates, including unsafe title text',()=>{
 const rss=renderRss(site,{items:[row,{...row,status:'draft',title:'DRAFT'},{...row,publishDate:'2999-01-01',title:'FUTURE'},{...row,publishDate:'broken',title:'INVALID'}],title:'TMMOB',feedPath:'/rss.xml'});
 assert.equal((rss.match(/<item>/g)||[]).length,1);assert(!rss.includes('DRAFT'));assert(!rss.includes('FUTURE'));assert(!rss.includes('INVALID'));
});
test('sitemaps are split below Google limits and encode URLs/dates without invented dates',()=>{
 const items=Array.from({length:5001},(_,i)=>({section:'contents',path:`/içerik-${i}`}));
 items.push({section:'events',path:'/etkinlik/1?a=1&b=2',lastmod:'2026-01-01'});
 const parts=sitemapParts(items);assert.deepEqual(parts.map(p=>p.items.length),[5000,1,1]);
 const index=renderSitemapIndex(site,items);assert(index.includes('/sitemaps/contents-2.xml'));assert(index.includes('<lastmod>2026-01-01T00:00:00.000Z</lastmod>'));
 const output=renderSitemap(site,[items[0],items.at(-1)]);assert(output.includes('/i%C3%A7erik-0'));assert(output.includes('a=1&amp;b=2'));assert.equal((output.match(/<lastmod>/g)||[]).length,1);
 assert.throws(()=>absoluteUrl(site,'//evil.example'),/Local path/);
});
test('one shared discovery revision purges all feeds and catalog entries across instances',async()=>{
 const directory=await mkdtemp(path.join(tmpdir(),'tmmob-discovery-test-'));
 try{
  let calls=0;const sharedRevisionFile=path.join(directory,'revision');
  const cache=key=>createServerMenuCache({key,directory,sharedRevisionFile,load:async()=>({items:[{id:++calls}]}),ttlMs:3600000});
  const catalog=cache('catalog'),feed=cache('feed'),webhook=cache('webhook');await catalog.get();await feed.get();assert.equal(calls,2);
  await webhook.invalidate();await catalog.get();await feed.get();assert.equal(calls,4);
 }finally{await rm(directory,{recursive:true,force:true});}
});
async function discovery(){
 const source=await readFile(new URL('../src/lib/siteDiscovery.js',import.meta.url),'utf8');
 const create=({load})=>({get:load,invalidate:async()=>{}});
 return new Function('path','createServerMenuCache','getApiBaseUrl','isoDate','getChamberSlug',source.replace(/^import .*;\n/gm,'').replace(/export /g,'')+';return {getFeed,getDiscoveryCatalog,affectsDiscovery,categoryPath};')(path,create,()=> 'https://api.example',value=>value?new Date(value).toISOString():null,row=>row.slug || row.short?.toLowerCase());
}
function publicApi({missing=false,fail=false}={}){
 globalThis.fetch=async url=>{
  const u=new URL(url),route=u.pathname;let payload=[];
  if(route==='/category')payload=[{_id:'cat',name:'Haberler',slug:'haberler'}];
  else if(route==='/contents/public-index')payload={contents:[row,{...row,_id:'2',slug:'kategorisiz'}],totalDocuments:missing?3:2,totalPages:1};
  else if(route.startsWith('/contents/bycategoryId/'))payload={contents:[row],totalDocuments:1,totalPages:1};
  else if(route==='/chambers')payload={data:[{short:'EMO'}],totalPages:1};
  else if(['/publication','/reports','/decisions'].includes(route))payload={data:[],totalPages:1};
  else if(route==='/events/list')payload={events:[],totalPages:1};
  else if(route==='/videos')payload={videos:[],totalPages:1};
  else if(!['/report-categories','/work-group-families'].includes(route))throw Error('Unexpected source '+route);
  return {ok:!fail,status:fail?503:200,json:async()=>payload};
 };
}
test('catalog includes categoryless published contents through metadata, excludes legacy aliases, and validates completeness',async()=>{
 publicApi();let api=await discovery();let catalog=await api.getDiscoveryCatalog();
 assert.equal(catalog.publicContentCount,2);assert(catalog.items.some(i=>i.path==='/kategorisiz'));
 assert(catalog.items.some(i=>i.path==='/kategori/haberler'));assert(catalog.items.some(i=>i.path==='/oda-kurullari/emo'));
 assert.equal(new Set(catalog.items.map(i=>i.path)).size,catalog.items.length);
 publicApi({missing:true});api=await discovery();await assert.rejects(()=>api.getDiscoveryCatalog(),/coverage incomplete/);
});
test('category RSS resolves only configured categories and backend failures never masquerade as valid empty feeds',async()=>{
 publicApi();const api=await discovery();const feed=await api.getFeed('haberler');assert.equal(feed.items.length,1);assert.equal(feed.feedPath,'/rss/kategori/haberler.xml');assert.equal(await api.getFeed('unknown'),null);
 publicApi({fail:true});await assert.rejects(()=>api.getFeed(),/unavailable/);
 assert(api.affectsDiscovery('content.updated'));assert(api.affectsDiscovery('publication.update'));assert(!api.affectsDiscovery('campaign.update'));
});

test('XML response failures are 503 with retry; unknown routes are genuine 404s without an incomplete sitemap',async()=>{
 const source=await readFile(new URL('../src/lib/discoveryResponse.js',import.meta.url),'utf8');
 const factory=new Function('getSiteUrl','getDiscoveryCatalog','getFeed','renderRss','renderSitemap','renderSitemapIndex','sitemapParts',source.replace(/^import .*;\n/gm,'').replace('export async function','async function')+';return serveDiscovery;');
 const serve=factory(()=>site,async()=>({items:[]}),async()=>{throw Error('source failed');},renderRss,renderSitemap,renderSitemapIndex,sitemapParts);
 const headers={},res={setHeader(k,v){headers[k]=v;},end(text){this.text=text;}};
 await serve(res,{type:'rss'});assert.equal(res.statusCode,503);assert.equal(headers['Retry-After'],'60');assert.equal(headers['Cache-Control'],'no-store');assert(!res.text.includes('source failed'));
 const missing=await serve(res,{type:'sitemap',part:'contents-999.xml'});assert.deepEqual(missing,{notFound:true});
});
test('content webhook awaits discovery invalidation only after signature verification',async()=>{
 const source=await readFile(new URL('../src/pages/api/webhooks.js',import.meta.url),'utf8');let calls=0,finished=false,status;
 const run=new Function('affectsDiscovery','invalidateDiscoveryCache','refreshMenuCaches','verifySignature','invalidateServerSettingsCache','return ('+source.replace(/^import .*;\n/gm,'').replace('export default ','').trim()+')')(()=>true,async()=>{calls++;await Promise.resolve();finished=true;},async()=>{},(_,sig)=>sig==='valid',()=>{});
 const res={setHeader(){},status(n){status=n;return this;},json(x){return x;}};
 await run({method:'POST',headers:{'x-cms-event':'content.updated'},body:{}},res);assert.equal(status,401);assert.equal(calls,0);
 await run({method:'POST',headers:{'x-cms-event':'content.updated','x-cms-signature':'valid'},body:{}},res);assert.equal(status,200);assert.equal(calls,1);assert(finished);
});
