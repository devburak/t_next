const DEFAULT_MAIN_MENU_SLUG = 'ana-menu';
const DEFAULT_MENU_CACHE_TTL_MS = 1000 * 60 * 5;
const EXTERNAL_SCHEME_REGEX = /^[a-z][a-z0-9+.-]*:/i;

const parsedMenuCacheTtl = Number.parseInt(process.env.MAIN_MENU_CACHE_TTL_MS || '', 10);
const MAIN_MENU_CACHE_TTL_MS = Number.isFinite(parsedMenuCacheTtl) && parsedMenuCacheTtl > 0
  ? parsedMenuCacheTtl
  : DEFAULT_MENU_CACHE_TTL_MS;

let serverCache = {
  data: null,
  expiresAt: 0,
  fetchPromise: null,
};

const getApiBaseUrl = () => String(process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '').trim();

export function getMainMenuSlug() {
  return String(
    process.env.MAIN_MENU_SLUG || process.env.NEXT_PUBLIC_MAIN_MENU_SLUG || DEFAULT_MAIN_MENU_SLUG
  ).trim();
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function sortMenuNodes(nodes = []) {
  return [...nodes].sort((a, b) => {
    const orderDiff = toNumber(a?.order) - toNumber(b?.order);
    if (orderDiff !== 0) {
      return orderDiff;
    }

    const textA = String(a?.text || '');
    const textB = String(b?.text || '');
    return textA.localeCompare(textB, 'tr', { sensitivity: 'base' });
  });
}

function normalizeMenuUrl(url) {
  const rawUrl = String(url || '').trim();
  if (!rawUrl) {
    return '';
  }

  if (rawUrl.startsWith('/') || rawUrl.startsWith('#') || rawUrl.startsWith('//')) {
    return rawUrl;
  }

  if (EXTERNAL_SCHEME_REGEX.test(rawUrl)) {
    return rawUrl;
  }

  return `/${rawUrl}`;
}

function getParentId(item) {
  if (!item?.parent) {
    return null;
  }

  if (typeof item.parent === 'object') {
    return item.parent?._id ? String(item.parent._id) : null;
  }

  return String(item.parent);
}

function buildTreeFromFlatItems(flatItems = []) {
  const nodeMap = new Map();
  const roots = [];

  flatItems.forEach((item) => {
    if (!item || item.isActive === false) {
      return;
    }

    const id = String(item._id || '');
    if (!id) {
      return;
    }

    nodeMap.set(id, {
      ...item,
      children: [],
    });
  });

  nodeMap.forEach((node) => {
    const parentId = getParentId(node);
    if (parentId && nodeMap.has(parentId)) {
      nodeMap.get(parentId).children.push(node);
      return;
    }

    roots.push(node);
  });

  const sortTree = (nodes = []) => sortMenuNodes(nodes).map((node) => ({
    ...node,
    children: sortTree(node.children || []),
  }));

  return sortTree(roots);
}

function extractTreeItems(menuPayload) {
  if (Array.isArray(menuPayload?.tree)) {
    const treeItems = menuPayload.tree.filter((item) => item?.isActive !== false);

    if (treeItems.some((item) => Array.isArray(item?.children))) {
      const sortTree = (nodes = []) => sortMenuNodes(nodes).map((node) => ({
        ...node,
        children: sortTree(Array.isArray(node?.children) ? node.children : []),
      }));

      return sortTree(treeItems);
    }

    return buildTreeFromFlatItems(treeItems);
  }

  if (Array.isArray(menuPayload?.items)) {
    const items = menuPayload.items.filter((item) => item?.isActive !== false);

    if (items.some((item) => Array.isArray(item?.children))) {
      const sortTree = (nodes = []) => sortMenuNodes(nodes).map((node) => ({
        ...node,
        children: sortTree(Array.isArray(node?.children) ? node.children : []),
      }));

      return sortTree(items);
    }

    return buildTreeFromFlatItems(items);
  }

  return [];
}

function mapChildrenToSubItems(nodes = []) {
  const subItems = [];

  sortMenuNodes(nodes).forEach((node) => {
    if (!node || node.isActive === false) {
      return;
    }

    const name = String(node.text || '').trim();
    if (!name) {
      return;
    }

    const path = normalizeMenuUrl(node.url || node.reference?.url || '');
    if (path) {
      subItems.push({
        id: String(node._id || name),
        name,
        path,
        target: node.target || '_self',
      });
      return;
    }

    if (Array.isArray(node.children) && node.children.length > 0) {
      subItems.push(...mapChildrenToSubItems(node.children));
    }
  });

  return subItems;
}

function mapTreeToTopMenuItems(treeItems = []) {
  return sortMenuNodes(treeItems)
    .map((node) => {
      if (!node || node.isActive === false) {
        return null;
      }

      const name = String(node.text || '').trim();
      if (!name) {
        return null;
      }

      const path = normalizeMenuUrl(node.url || node.reference?.url || '');
      const subItems = mapChildrenToSubItems(Array.isArray(node.children) ? node.children : []);

      if (subItems.length > 0) {
        return {
          id: String(node._id || name),
          name,
          prfx: path || undefined,
          subItems,
        };
      }

      return {
        id: String(node._id || name),
        name,
        path,
        prfx: path,
        target: node.target || '_self',
      };
    })
    .filter(Boolean);
}

async function fetchMainMenuFromApi() {
  const apiBaseUrl = getApiBaseUrl();
  const menuSlug = getMainMenuSlug();

  if (!apiBaseUrl) {
    console.error('[MainMenuCache] Missing API base URL');
    return null;
  }

  try {
    const response = await fetch(`${apiBaseUrl}/public/menus/slug/${encodeURIComponent(menuSlug)}`, {
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Main menu API error: ${response.status}`);
    }

    const payload = await response.json();
    const treeItems = extractTreeItems(payload);
    const items = mapTreeToTopMenuItems(treeItems);

    return {
      slug: payload?.slug || menuSlug,
      updatedAt: payload?.updatedAt || new Date().toISOString(),
      items,
    };
  } catch (error) {
    console.error('[MainMenuCache] Failed to fetch main menu:', error);
    return null;
  }
}

export function invalidateServerMainMenuCache() {
  serverCache = {
    data: null,
    expiresAt: 0,
    fetchPromise: null,
  };
  console.log('[MainMenuCache] Server cache invalidated');
}

export async function getServerMainMenu() {
  const now = Date.now();

  if (serverCache.data && serverCache.expiresAt > now) {
    return serverCache.data;
  }

  if (serverCache.fetchPromise) {
    return serverCache.fetchPromise;
  }

  serverCache.fetchPromise = (async () => {
    const data = await fetchMainMenuFromApi();

    if (data !== null) {
      serverCache.data = data;
      serverCache.expiresAt = now + MAIN_MENU_CACHE_TTL_MS;
    }

    serverCache.fetchPromise = null;

    return serverCache.data || {
      slug: getMainMenuSlug(),
      updatedAt: null,
      items: [],
    };
  })();

  return serverCache.fetchPromise;
}
