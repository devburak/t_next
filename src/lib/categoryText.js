export function getCategoryDisplayName(value = '') {
  return String(value || '')
    .replace(/-/g, ' ')
    .trim();
}

export function getCategoryHeading(value = '') {
  return getCategoryDisplayName(value).toLocaleUpperCase('tr-TR');
}
