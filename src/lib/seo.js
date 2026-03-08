import { getSettings } from './settingsCache';

const DEFAULT_SITE_URL = 'https://tmmob.org.tr';
export const DEFAULT_OG_IMAGE = 'https://storage.ikon-x.com.tr/default.png';
export const DEFAULT_META_DESCRIPTION =
  'Türk Mühendis ve Mimar Odaları Birliği resmi sitesi; haberler, basın açıklamaları, yayınlar, etkinlikler ve kurumsal duyurular.';

/**
 * Settings cache'den veya fallback olarak sabit default image URL'ini döndürür
 */
export async function getDefaultImage() {
  try {
    const settings = await getSettings();
    return settings?.defaultImage?.url || DEFAULT_OG_IMAGE;
  } catch (error) {
    console.error('Error getting default image from settings:', error);
    return DEFAULT_OG_IMAGE;
  }
}

export function normalizeBaseUrl(value) {
  const normalized = String(value || DEFAULT_SITE_URL).trim().replace(/\/+$/, '');
  return normalized || DEFAULT_SITE_URL;
}

export function getSiteUrl() {
  return normalizeBaseUrl(process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || DEFAULT_SITE_URL);
}

export function getApiBaseUrl() {
  const apiBaseUrl = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL;
  return apiBaseUrl ? normalizeBaseUrl(apiBaseUrl) : '';
}

export function buildCanonicalUrl(pathname = '') {
  const path = String(pathname || '').trim().replace(/^\/+/, '');
  return path ? `${getSiteUrl()}/${path}` : getSiteUrl();
}

export function stripHtml(value = '') {
  return String(value)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function buildMetaDescription(value, fallback = DEFAULT_META_DESCRIPTION, maxLength = 160) {
  const text = stripHtml(value || fallback) || fallback;
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 3).trim()}...`;
}

export function toIsoDate(value) {
  if (!value) {
    return undefined;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
}
