export const CLIENT_MENU_TTL_MS = 60_000;
const entries = new Map();
function entryFor(kind) {
  if (!['main', 'right'].includes(kind)) throw new Error('Unknown menu');
  if (!entries.has(kind)) entries.set(kind, { items: null, expiresAt: 0, generation: 0, promise: null, listeners: new Set() });
  return entries.get(kind);
}
export const getMenuSnapshot = kind => entryFor(kind).items;
export function subscribeMenu(kind, listener) {
  const entry = entryFor(kind);
  entry.listeners.add(listener);
  return () => entry.listeners.delete(listener);
}
function notify(entry) { for (const listener of entry.listeners) listener(); }
export function seedClientMenu(kind, items) {
  if (!Array.isArray(items)) return;
  const entry = entryFor(kind);
  entry.generation++;
  entry.promise = null;
  entry.items = items;
  entry.expiresAt = Date.now() + CLIENT_MENU_TTL_MS;
  notify(entry);
}
export async function getClientMenu(kind) {
  const entry = entryFor(kind);
  if (entry.expiresAt > Date.now()) return entry.items;
  if (entry.promise) return entry.promise;
  const generation = entry.generation;
  const request = (async () => {
    try {
      const response = await fetch(`/api/menu/${kind}`, { cache: 'no-store' });
      if (!response.ok) throw new Error('Menu unavailable');
      const payload = await response.json();
      if (payload.success !== true || !Array.isArray(payload.items)) throw new Error('Invalid menu');
      if (entry.generation === generation) {
        entry.items = payload.items;
        entry.expiresAt = Date.now() + CLIENT_MENU_TTL_MS;
        notify(entry);
      }
    } catch {
      // Keep the last good menu, with a bounded retry delay and no polling.
      if (entry.generation === generation) entry.expiresAt = Date.now() + 10_000;
    }
    return entry.items;
  })();
  entry.promise = request;
  try { return await request; }
  finally { if (entry.promise === request) entry.promise = null; }
}
