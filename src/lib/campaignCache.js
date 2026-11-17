// The homepage already uses ISR. Fetch fresh data whenever it regenerates;
// a second server memory cache would outlive the page and differ across bundles.
const CAMPAIGN_CACHE_KEY = 'tmmob:campaigns:v2';
const LEGACY_CACHE_KEY = 'tmmob:campaigns:v1';
export const CAMPAIGN_CACHE_TTL_MS = 60_000;
let clientMemoryCache = null;
let clientExpiresAt = 0;
let clientGeneration = 0;
const activeCampaigns = (items) =>
  Array.isArray(items) ? items.filter((item) => item?.isActive === true) : [];
const getApiBaseUrl = () => process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL;

async function fetchCampaignsFromApi({ signal } = {}) {
  try {
    const response = await fetch(`${getApiBaseUrl()}/campaigns/active`, {
      cache: 'no-store',
      signal,
    });
    if (!response.ok) throw new Error(`Campaign API error: ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error('Invalid campaign response');
    return activeCampaigns(data);
  } catch (error) {
    if (error?.name !== 'AbortError')
      console.error('[CampaignCache] Campaigns could not be loaded');
    return null;
  }
}

export async function getServerCampaigns() {
  return (await fetchCampaignsFromApi()) || [];
}

function readClientStoredCache() {
  if (typeof window === 'undefined') return null;
  try {
    window.localStorage.removeItem(LEGACY_CACHE_KEY);
    const parsed = JSON.parse(window.localStorage.getItem(CAMPAIGN_CACHE_KEY) || 'null');
    if (
      !Array.isArray(parsed?.data) ||
      !Number.isFinite(parsed.expiresAt) ||
      parsed.expiresAt <= Date.now() ||
      parsed.expiresAt > Date.now() + CAMPAIGN_CACHE_TTL_MS
    )
      return null;
    return { data: activeCampaigns(parsed.data), expiresAt: parsed.expiresAt };
  } catch {
    return null;
  }
}

function persistClientCache(data) {
  clientMemoryCache = activeCampaigns(data);
  clientExpiresAt = Date.now() + CAMPAIGN_CACHE_TTL_MS;
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(LEGACY_CACHE_KEY);
      window.localStorage.setItem(
        CAMPAIGN_CACHE_KEY,
        JSON.stringify({ data: clientMemoryCache, expiresAt: clientExpiresAt })
      );
    } catch {
      /* Campaigns still work when browser storage is unavailable. */
    }
  }
}

export function invalidateClientCache() {
  clientGeneration++;
  clientMemoryCache = null;
  clientExpiresAt = 0;
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(CAMPAIGN_CACHE_KEY);
      window.localStorage.removeItem(LEGACY_CACHE_KEY);
    } catch {
      /* Storage may be disabled. */
    }
  }
}

// New page props are authoritative, including an empty active campaign list.
export function seedClientCampaigns(data) {
  invalidateClientCache();
  persistClientCache(data);
}

export async function getClientCampaigns({ signal, force = false } = {}) {
  if (!force) {
    if (clientMemoryCache !== null && clientExpiresAt > Date.now()) return clientMemoryCache;
    const stored = readClientStoredCache();
    if (stored) {
      clientMemoryCache = stored.data;
      clientExpiresAt = stored.expiresAt; // Never extend a stored entry just by reading it.
      return stored.data;
    }
  }
  const generation = clientGeneration;
  const data = await fetchCampaignsFromApi({ signal });
  if (signal?.aborted) return [];
  if (generation !== clientGeneration) return clientMemoryCache || [];
  if (data !== null) persistClientCache(data);
  return data || [];
}

export async function getCampaigns(options = {}) {
  return typeof window === 'undefined' ? getServerCampaigns() : getClientCampaigns(options);
}

export async function refreshCampaigns() {
  invalidateClientCache();
  return getCampaigns({ force: true });
}
