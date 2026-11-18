import { getServerMainMenu, invalidateServerMainMenuCache } from './mainMenuCache';
import { getServerRightMenu, invalidateServerRightMenuCache } from './rightMenuCache';

export async function refreshMenuCaches(res) {
  await Promise.all([invalidateServerMainMenuCache(), invalidateServerRightMenuCache()]);
  const menus = await Promise.all([getServerMainMenu(), getServerRightMenu()]);
  if (menus.some(menu => menu === null)) throw new Error('Menu refresh failed');
  // The ISR homepage contains the initial menus; update it after the shared cache.
  await res.revalidate('/');
}
