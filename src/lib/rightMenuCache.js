const DEFAULT_RIGHT_MENU_SLUG = 'sag-menu';
const DEFAULT_RIGHT_MENU_CACHE_TTL_MS = 1000 * 60 * 5;
const EXTERNAL_SCHEME_REGEX = /^[a-z][a-z0-9+.-]*:/i;

const parsedMenuCacheTtl = Number.parseInt(process.env.RIGHT_MENU_CACHE_TTL_MS || '', 10);
const RIGHT_MENU_CACHE_TTL_MS = Number.isFinite(parsedMenuCacheTtl) && parsedMenuCacheTtl > 0
  ? parsedMenuCacheTtl
  : DEFAULT_RIGHT_MENU_CACHE_TTL_MS;

let serverCache = {
  data: null,
  expiresAt: 0,
  fetchPromise: null,
};

const getApiBaseUrl = () => String(process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '').trim();

export function getRightMenuSlug() {
  return String(
    process.env.RIGHT_MENU_SLUG || process.env.NEXT_PUBLIC_RIGHT_MENU_SLUG || DEFAULT_RIGHT_MENU_SLUG
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

    const textA = String(a?.text || a?.accessibilityLabel || '');
    const textB = String(b?.text || b?.accessibilityLabel || '');
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

function pickImagePayload(node = {}) {
  const image = node.image || {};
  const thumbnails = Array.isArray(image.thumbnails) ? image.thumbnails : [];
  const preferredThumb = thumbnails.find((thumb) => thumb?.size === 'large')
    || thumbnails.find((thumb) => thumb?.size === 'medium')
    || thumbnails.find((thumb) => thumb?.size === 'small')
    || null;

  const url = String(
    image.url
    || image.mediaId?.url
    || preferredThumb?.url
    || ''
  ).trim();

  return {
    url,
    alt: String(image.altText || node.accessibilityLabel || node.text || '').trim(),
    thumbnails,
  };
}

function pickIconPayload(node = {}) {
  if (!node.icon || typeof node.icon !== 'object') {
    return null;
  }

  const source = String(node.icon.source || '').trim();
  const value = String(node.icon.value || '').trim();

  if (!source || !value) {
    return null;
  }

  return { source, value };
}

function createRightMenuItem(node = {}) {
  const displayType = String(node.displayType || 'text').trim();
  const href = normalizeMenuUrl(node.url || node.reference?.url || '');
  const image = pickImagePayload(node);
  const icon = pickIconPayload(node);
  const text = String(node.text || '').trim();
  const label = String(node.accessibilityLabel || text || image.alt || icon?.value || '').trim();

  const shouldInclude = Boolean(href || image.url || text || icon?.value || label);
  if (!shouldInclude) {
    return null;
  }

  return {
    id: String(node._id || `${displayType}-${label || text || 'item'}`),
    displayType,
    href,
    target: node.target || '_self',
    text,
    label: label || text || 'Menu item',
    image,
    icon,
    order: toNumber(node.order),
  };
}

function flattenMenuNodes(nodes = [], collector = []) {
  sortMenuNodes(nodes).forEach((node) => {
    if (!node || node.isActive === false) {
      return;
    }

    const item = createRightMenuItem(node);
    if (item) {
      collector.push(item);
    }

    if (Array.isArray(node.children) && node.children.length > 0) {
      flattenMenuNodes(node.children, collector);
    }
  });

  return collector;
}

async function fetchRightMenuFromApi() {
  const apiBaseUrl = getApiBaseUrl();
  const menuSlug = getRightMenuSlug();

  if (!apiBaseUrl) {
    console.error('[RightMenuCache] Missing API base URL');
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
      throw new Error(`Right menu API error: ${response.status}`);
    }

    const payload = await response.json();
    const treeItems = extractTreeItems(payload);
    const items = flattenMenuNodes(treeItems);

    return {
      slug: payload?.slug || menuSlug,
      updatedAt: payload?.updatedAt || new Date().toISOString(),
      items,
    };
  } catch (error) {
    console.error('[RightMenuCache] Failed to fetch right menu:', error);
    return null;
  }
}

export function invalidateServerRightMenuCache() {
  serverCache = {
    data: null,
    expiresAt: 0,
    fetchPromise: null,
  };
  console.log('[RightMenuCache] Server cache invalidated');
}

export async function getServerRightMenu() {
  const now = Date.now();

  if (serverCache.data && serverCache.expiresAt > now) {
    return serverCache.data;
  }

  if (serverCache.fetchPromise) {
    return serverCache.fetchPromise;
  }

  serverCache.fetchPromise = (async () => {
    const data = await fetchRightMenuFromApi();

    if (data !== null) {
      serverCache.data = data;
      serverCache.expiresAt = now + RIGHT_MENU_CACHE_TTL_MS;
    }

    serverCache.fetchPromise = null;

    return serverCache.data || {
      slug: getRightMenuSlug(),
      updatedAt: null,
      items: [],
    };
  })();

  return serverCache.fetchPromise;
}
