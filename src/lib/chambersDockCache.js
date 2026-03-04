const CHAMBERS_DOCK_CACHE_KEY = 'tmmob:chambers-dock:v3';
const CHAMBERS_DOCK_CACHE_TTL_MS = 1000 * 60 * 60 * 12;

let memoryCache = [];
let memoryExpiresAt = 0;
let inflightRequest = null;

function normalizeExternalUrl(value) {
  const trimmed = String(value || '').trim();

  if (!trimmed) {
    return '';
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`;
  }

  return `https://${trimmed.replace(/^\/+/, '')}`;
}

function normalizeChambers(payload) {
  const chambers = Array.isArray(payload?.data) ? payload.data : [];

  return chambers
    .map((chamber) => {
      const short = String(chamber?.short || '').trim();
      const name = String(chamber?.name || short).trim();
      const logoSrc = String(chamber?.logo?.url || '').trim();

      if (!short || !logoSrc) {
        return null;
      }

      return {
        id: chamber?._id || short,
        short,
        name,
        href: normalizeExternalUrl(chamber?.website),
        logoSrc,
      };
    })
    .filter(Boolean);
}

function persistChambersDockCache(data) {
  const nextData = Array.isArray(data) ? data : [];
  const expiresAt = Date.now() + CHAMBERS_DOCK_CACHE_TTL_MS;

  memoryCache = nextData;
  memoryExpiresAt = expiresAt;

  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(
      CHAMBERS_DOCK_CACHE_KEY,
      JSON.stringify({
        data: nextData,
        expiresAt,
      })
    );
  } catch (error) {
    console.error('Failed to persist chambers dock cache:', error);
  }
}

function readStoredChambersDockCache() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(CHAMBERS_DOCK_CACHE_KEY);

    if (!rawValue) {
      return null;
    }

    const parsedValue = JSON.parse(rawValue);
    const data = Array.isArray(parsedValue?.data) ? parsedValue.data : [];
    const expiresAt = Number(parsedValue?.expiresAt) || 0;

    return {
      data,
      expiresAt,
    };
  } catch (error) {
    console.error('Failed to read chambers dock cache:', error);
    return null;
  }
}

export function getChambersDockSnapshot() {
  const now = Date.now();

  if (memoryCache.length > 0) {
    return {
      data: memoryCache,
      isStale: memoryExpiresAt <= now,
    };
  }

  const storedCache = readStoredChambersDockCache();

  if (!storedCache || storedCache.data.length === 0) {
    return {
      data: [],
      isStale: true,
    };
  }

  memoryCache = storedCache.data;
  memoryExpiresAt = storedCache.expiresAt;

  return {
    data: storedCache.data,
    isStale: storedCache.expiresAt <= now,
  };
}

export async function fetchChambersDockData({ force = false } = {}) {
  const snapshot = getChambersDockSnapshot();

  if (!force && snapshot.data.length > 0 && !snapshot.isStale) {
    return snapshot.data;
  }

  if (inflightRequest) {
    return inflightRequest;
  }

  const apiBaseUrl = String(process.env.NEXT_PUBLIC_API_BASE_URL || '').trim();

  if (!apiBaseUrl) {
    return snapshot.data;
  }

  inflightRequest = fetch(`${apiBaseUrl}/chambers?limit=100`)
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`Chambers request failed with status ${response.status}`);
      }

      const payload = await response.json();
      const normalizedData = normalizeChambers(payload);

      persistChambersDockCache(normalizedData);
      return normalizedData;
    })
    .catch((error) => {
      console.error('Failed to fetch chambers dock data:', error);
      return snapshot.data;
    })
    .finally(() => {
      inflightRequest = null;
    });

  return inflightRequest;
}
