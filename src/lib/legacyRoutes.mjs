export function normalizeLegacyPath(value) {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.length > 2048
  )
    return null;
  let path;
  try {
    path = decodeURIComponent(value.split(/[?#]/)[0]);
  } catch {
    return null;
  }
  if (
    /[\\?#%\u0000-\u001f\u007f]/.test(path) ||
    path.startsWith("//") ||
    path.split("/").some((part) => part === "." || part === "..")
  )
    return null;
  return path.replace(/\/{2,}/g, "/").replace(/\/+$/, "") || "/";
}
export function safeLegacyLocation(location) {
  if (!normalizeLegacyPath(location)) return null;
  try {
    const url = new URL(location, "https://local.invalid");
    return url.origin === "https://local.invalid"
      ? url.pathname + url.search + url.hash
      : null;
  } catch {
    return null;
  }
}
export function createLegacyRouteCache({
  seed = [],
  fetcher = fetch,
  ttl = 60000,
  now = Date.now,
} = {}) {
  function validated(rows) {
    if (!Array.isArray(rows) || rows.length > 50000)
      throw Error("Invalid route manifest");
    const map = new Map();
    for (const row of rows) {
      const path = normalizeLegacyPath(row.path);
      if (!path || ![301, 410].includes(row.status))
        throw Error("Invalid legacy route");
      const location =
        row.status === 301 ? safeLegacyLocation(row.location) : null;
      if (
        row.status === 301 &&
        (!location || normalizeLegacyPath(location) === path)
      )
        throw Error("Invalid legacy destination");
      map.set(path, { status: row.status, location });
    }
    return map;
  }
  let map = validated(seed),
    expiresAt = 0,
    pending = null;
  return {
    lookup(path) {
      return map.get(normalizeLegacyPath(path)) || null;
    },
    refresh(apiBaseUrl) {
      if (!apiBaseUrl || now() < expiresAt) return Promise.resolve();
      if (pending) return pending;
      pending = Promise.resolve().then(async () => {
        try {
          const response = await fetcher(
            apiBaseUrl.replace(/\/$/, "") + "/legacy/routes",
            { signal: AbortSignal.timeout(2000) },
          );
          if (!response.ok) throw Error("Route manifest unavailable");
          map = validated(await response.json());
          expiresAt = now() + ttl;
        } catch {
          expiresAt = now() + 10000; /* Keep the last verified manifest. */
        } finally {
          pending = null;
        }
      });
      return pending;
    },
  };
}
