import { useEffect, useSyncExternalStore, useCallback } from 'react';
import { getClientMenu, getMenuSnapshot, seedClientMenu, subscribeMenu } from '../lib/clientMenuCache.mjs';

export default function useMenu(kind, initialItems, fallbackItems) {
  const subscribe = useCallback(listener => subscribeMenu(kind, listener), [kind]);
  const snapshot = useCallback(() => getMenuSnapshot(kind), [kind]);
  const serverSnapshot = useCallback(() => Array.isArray(initialItems) ? initialItems : null, [initialItems]);
  const items = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  useEffect(() => {
    if (Array.isArray(initialItems)) seedClientMenu(kind, initialItems);
    else void getClientMenu(kind);
  }, [kind, initialItems]);
  // Empty CMS menus are intentional; use fallback only before any successful data.
  return items ?? (Array.isArray(initialItems) ? initialItems : fallbackItems);
}
