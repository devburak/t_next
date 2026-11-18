import { mkdir, readFile, rename, writeFile, stat, unlink } from 'node:fs/promises';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';

// A shared file makes webhook/API/ISR bundles see the same invalidation.
export const MAX_MENU_CACHE_ENTRY_BYTES = 512 * 1024;
const pendingKey = Symbol.for('tmmob.menu-cache.pending.v1');
const pending = globalThis[pendingKey] ||= new Map();
export function createServerMenuCache({ key, load, ttlMs, directory }) {
  const folder = directory || path.join(process.cwd(), process.env.NEXT_DIST_DIR || '.next', 'cache', 'site-menus');
  const file = path.join(folder, `${createHash('sha256').update(key).digest('hex')}.json`);
  const revisionFile = `${file}.revision`;
  const readRevision = async () => {
    try { return await readFile(revisionFile, 'utf8'); }
    catch (error) { if (error.code !== 'ENOENT') throw error; return 'initial'; }
  };
  const read = async () => {
    const revision = await readRevision();
    try {
      if ((await stat(file)).size > MAX_MENU_CACHE_ENTRY_BYTES) return { revision, data: null, expiresAt: 0 };
      const entry = JSON.parse(await readFile(file, 'utf8'));
      if (entry?.revision === revision && Number.isFinite(entry.expiresAt) && (entry.data === null || Array.isArray(entry.data?.items))) return entry;
    } catch (error) { if (error.code !== 'ENOENT' && !(error instanceof SyntaxError)) throw error; }
    return { revision, data: null, expiresAt: 0 };
  };
  const write = async (entry) => {
    await mkdir(folder, { recursive: true });
    const temporary = `${file}.${randomUUID()}.tmp`;
    const serialized = JSON.stringify(entry);
    if (Buffer.byteLength(serialized) > MAX_MENU_CACHE_ENTRY_BYTES) throw new Error('Menu cache entry exceeds size limit');
    try {
      await writeFile(temporary, serialized, { mode: 0o600 });
      await rename(temporary, file);
    } finally { await unlink(temporary).catch(error => { if (error.code !== 'ENOENT') throw error; }); }
  };
  const get = async (attempt = 0) => {
    const entry = await read();
    if (entry.expiresAt > Date.now()) return entry.data;
    const revision = entry?.revision || 'initial';
    const requestKey = `${file}:${revision}`;
    if (pending.has(requestKey)) return pending.get(requestKey);
    const request = (async () => {
      const data = await load();
      const latest = await read();
      if ((latest?.revision || 'initial') !== revision) {
        // A webhook arrived while the old request was running. Never restore it.
        return attempt < 2 ? get(attempt + 1) : latest?.data || null;
      }
      await write({ revision, data: data ?? entry?.data ?? null, expiresAt: Date.now() + (data === null ? 30_000 : ttlMs) });
      if (await readRevision() !== revision) return attempt < 2 ? get(attempt + 1) : null;
      return data ?? entry?.data ?? null;
    })();
    pending.set(requestKey, request);
    try { return await request; }
    finally { if (pending.get(requestKey) === request) pending.delete(requestKey); }
  };
  return {
    get,
    async invalidate() {
      await mkdir(folder, { recursive: true });
      const temporary = `${revisionFile}.${randomUUID()}.tmp`;
      await writeFile(temporary, randomUUID(), { mode: 0o600 });
      await rename(temporary, revisionFile);
    },
  };
}
