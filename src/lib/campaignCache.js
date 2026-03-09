/**
 * Campaign Cache System
 * 
 * Server-tarafında in-memory cache tutar.
 * Webhook geldiğinde cache invalidate edilir ve yeni veri çekilir.
 * Client-tarafında memory + localStorage kullanır.
 */

const CAMPAIGN_CACHE_KEY = 'tmmob:campaigns:v1';
const CAMPAIGN_CACHE_TTL_MS = 1000 * 60 * 60; // 1 saat

// Server-side in-memory cache
let serverCache = {
  data: null,
  expiresAt: 0,
  fetchPromise: null
};

// Client-side memory cache
let clientMemoryCache = [];
let clientExpiresAt = 0;

const getApiBaseUrl = () => process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * Kampanyaları API'den çeker
 */
async function fetchCampaignsFromApi() {
  try {
    const apiBaseUrl = getApiBaseUrl();
    const response = await fetch(`${apiBaseUrl}/campaigns/active`, {
      cache: 'no-store' // Next.js fetch cache'ini devre dışı bırak
    });
    if (!response.ok) {
      throw new Error(`Campaign API error: ${response.status}`);
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Failed to fetch campaigns from API:', error);
    return null;
  }
}

/**
 * Server-side: Cache'i invalidate et (webhook tarafından çağrılır)
 */
export function invalidateServerCache() {
  serverCache = {
    data: null,
    expiresAt: 0,
    fetchPromise: null
  };
  console.log('[CampaignCache] Server cache invalidated');
}

/**
 * Server-side: Kampanyaları getir (cache'li)
 */
export async function getServerCampaigns() {
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
    const data = await fetchCampaignsFromApi();
    
    if (data !== null) {
      serverCache.data = data;
      serverCache.expiresAt = now + CAMPAIGN_CACHE_TTL_MS;
    }
    
    serverCache.fetchPromise = null;
    return serverCache.data || [];
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
    const rawValue = window.localStorage.getItem(CAMPAIGN_CACHE_KEY);
    if (!rawValue) return null;

    const parsed = JSON.parse(rawValue);
    if (!parsed || !Array.isArray(parsed.data)) return null;

    // Expire kontrolü
    if (typeof parsed.expiresAt === 'number' && parsed.expiresAt > Date.now()) {
      return parsed.data;
    }

    return null;
  } catch (error) {
    console.error('Failed to read campaign cache:', error);
    return null;
  }
}

/**
 * Client-side: Cache'i localStorage'a kaydet
 */
function persistClientCache(data) {
  const nextData = Array.isArray(data) ? data : [];
  const expiresAt = Date.now() + CAMPAIGN_CACHE_TTL_MS;

  clientMemoryCache = nextData;
  clientExpiresAt = expiresAt;

  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(
      CAMPAIGN_CACHE_KEY,
      JSON.stringify({
        data: nextData,
        expiresAt
      })
    );
  } catch (error) {
    console.error('Failed to persist campaign cache:', error);
  }
}

/**
 * Client-side: Cache'i invalidate et (webhook sonrası client refresh için)
 */
export function invalidateClientCache() {
  clientMemoryCache = [];
  clientExpiresAt = 0;

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(CAMPAIGN_CACHE_KEY);
    } catch (error) {
      console.error('Failed to clear campaign cache:', error);
    }
  }
}

/**
 * Client-side: Kampanyaları getir (cache'li)
 */
export async function getClientCampaigns() {
  const now = Date.now();

  // Memory cache geçerli ise kullan
  if (clientMemoryCache.length > 0 && clientExpiresAt > now) {
    return clientMemoryCache;
  }

  // localStorage'dan dene
  const storedCache = readClientStoredCache();
  if (storedCache) {
    clientMemoryCache = storedCache;
    clientExpiresAt = now + CAMPAIGN_CACHE_TTL_MS;
    return storedCache;
  }

  // API'den çek
  const data = await fetchCampaignsFromApi();
  if (data !== null) {
    persistClientCache(data);
    return data;
  }

  return [];
}

/**
 * Kampanyaları getir - ortama göre doğru cache kullanır
 */
export async function getCampaigns() {
  if (typeof window === 'undefined') {
    // Server-side
    return getServerCampaigns();
  }
  // Client-side
  return getClientCampaigns();
}

/**
 * Cache'i zorunlu olarak yenile (webhook sonrası)
 */
export async function refreshCampaigns() {
  invalidateServerCache();
  invalidateClientCache();
  return fetchCampaignsFromApi();
}
