/**
 * Settings Cache System
 * 
 * Server-tarafında in-memory cache tutar.
 * Webhook geldiğinde cache invalidate edilir ve yeni veri çekilir.
 */

const SETTINGS_CACHE_KEY = 'tmmob:settings:v1';
const SETTINGS_CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24 saat

// Server-side in-memory cache
let serverCache = {
  data: null,
  expiresAt: 0,
  fetchPromise: null
};

// Client-side memory cache
let clientMemoryCache = null;
let clientExpiresAt = 0;

const getApiBaseUrl = () => process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * Public settings'i API'den çeker
 */
async function fetchSettingsFromApi() {
  try {
    const apiBaseUrl = getApiBaseUrl();
    const response = await fetch(`${apiBaseUrl}/system/public-settings`, {
      cache: 'no-store' // Next.js fetch cache'ini devre dışı bırak
    });
    if (!response.ok) {
      throw new Error(`Settings API error: ${response.status}`);
    }
    const data = await response.json();
    return data || {};
  } catch (error) {
    console.error('Failed to fetch settings from API:', error);
    return null;
  }
}

/**
 * Server-side: Cache'i invalidate et (webhook tarafından çağrılır)
 */
export function invalidateServerSettingsCache() {
  serverCache = {
    data: null,
    expiresAt: 0,
    fetchPromise: null
  };
  console.log('[SettingsCache] Server cache invalidated');
}

/**
 * Server-side: Settings'i getir (cache'li)
 */
export async function getServerSettings() {
  const now = Date.now();

  // Cache geçerli ise kullan
  if (serverCache.data && serverCache.expiresAt > now) {
    return serverCache.data;
  }

  // Zaten bir fetch işlemi varsa onu bekle (de-dupe)
  if (serverCache.fetchPromise) {
    return serverCache.fetchPromise;
  }

  // Yeni fetch başlat
  serverCache.fetchPromise = (async () => {
    const data = await fetchSettingsFromApi();
    
    if (data !== null) {
      serverCache.data = data;
      serverCache.expiresAt = now + SETTINGS_CACHE_TTL_MS;
    }
    
    serverCache.fetchPromise = null;
    return serverCache.data || {};
  })();

  return serverCache.fetchPromise;
}

/**
 * Client-side: localStorage'dan cache oku
 */
function readClientStoredCache() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(SETTINGS_CACHE_KEY);
    if (!rawValue) return null;

    const parsed = JSON.parse(rawValue);
    if (!parsed || typeof parsed.data !== 'object') return null;

    // Expire kontrolü
    if (typeof parsed.expiresAt === 'number' && parsed.expiresAt > Date.now()) {
      return parsed.data;
    }

    return null;
  } catch (error) {
    console.error('Failed to read settings cache:', error);
    return null;
  }
}

/**
 * Client-side: Cache'i localStorage'a kaydet
 */
function persistClientCache(data) {
  const nextData = data || {};
  const expiresAt = Date.now() + SETTINGS_CACHE_TTL_MS;

  clientMemoryCache = nextData;
  clientExpiresAt = expiresAt;

  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(
      SETTINGS_CACHE_KEY,
      JSON.stringify({
        data: nextData,
        expiresAt
      })
    );
  } catch (error) {
    console.error('Failed to persist settings cache:', error);
  }
}

/**
 * Client-side: Cache'i invalidate et
 */
export function invalidateClientSettingsCache() {
  clientMemoryCache = null;
  clientExpiresAt = 0;

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(SETTINGS_CACHE_KEY);
    } catch (error) {
      console.error('Failed to clear settings cache:', error);
    }
  }
}

/**
 * Client-side: Settings'i getir (cache'li)
 */
export async function getClientSettings() {
  const now = Date.now();

  // Memory cache geçerli ise kullan
  if (clientMemoryCache && clientExpiresAt > now) {
    return clientMemoryCache;
  }

  // localStorage'dan dene
  const storedCache = readClientStoredCache();
  if (storedCache) {
    clientMemoryCache = storedCache;
    clientExpiresAt = now + SETTINGS_CACHE_TTL_MS;
    return storedCache;
  }

  // API'den çek
  const data = await fetchSettingsFromApi();
  if (data !== null) {
    persistClientCache(data);
    return data;
  }

  return {};
}

/**
 * Settings'i getir - ortama göre doğru cache kullanır
 */
export async function getSettings() {
  if (typeof window === 'undefined') {
    // Server-side
    return getServerSettings();
  }
  // Client-side
  return getClientSettings();
}

/**
 * Default image URL'ini getir
 */
export async function getDefaultImageUrl() {
  const settings = await getSettings();
  return settings?.defaultImage?.url || null;
}

/**
 * Cache'i zorunlu olarak yenile (webhook sonrası)
 */
export async function refreshSettings() {
  invalidateServerSettingsCache();
  invalidateClientSettingsCache();
  return fetchSettingsFromApi();
}
