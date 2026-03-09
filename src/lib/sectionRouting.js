const SECTION_CATEGORY_ROUTE_CONFIG = {
  tmmob: {
    root: true,
    mode: 'all',
  },
  hukuk: {
    root: true,
    mode: 'all',
  },
};

export function buildSectionPath(section, slug = '') {
  return [section, slug]
    .map((value) => String(value || '').trim())
    .filter(Boolean)
    .join('/');
}

export function buildSectionPagePath(section, slug = '') {
  const path = buildSectionPath(section, slug);
  return path ? `/${path}` : '/';
}

export function shouldResolveSectionCategory(section, slug = '') {
  const safeSection = String(section || '').trim();
  const safeSlug = String(slug || '').trim();
  const config = SECTION_CATEGORY_ROUTE_CONFIG[safeSection];

  if (!config) {
    return false;
  }

  if (!safeSlug) {
    return Boolean(config.root);
  }

  if (config.mode === 'all') {
    return true;
  }

  return Array.isArray(config.slugs) && config.slugs.includes(safeSlug);
}

export async function fetchSectionCategoryPayload({
  apiBaseUrl,
  section,
  slug = '',
  query = {},
  includePeriod = true,
  categoryPathOverride = '',
}) {
  const categoryPath = String(categoryPathOverride || '').trim() || buildSectionPath(section, slug);
  if (!apiBaseUrl || !categoryPath) {
    return null;
  }

  const queryParams = new URLSearchParams({
    page: String(parseInt(query?.page, 10) || 1),
    ...(includePeriod && query?.periodId ? { periodId: String(query.periodId) } : {}),
  });

  const response = await fetch(
    `${apiBaseUrl}/contents/category/${categoryPath}?${queryParams.toString()}`
  );

  if (!response.ok) {
    return null;
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return null;
  }

  return response.json();
}
