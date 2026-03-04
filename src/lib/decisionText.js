function normalizeDecisionCategoryName(value = '') {
  const name = String(value || '').trim();
  if (!name) {
    return '';
  }

  return name
    .replace(/Kararlari$/i, 'Kararı')
    .replace(/Kararları$/i, 'Kararı')
    .trim();
}

function isGenericDecisionTitle(value = '') {
  const title = String(value || '').trim().toLowerCase();
  return !title || title === 'karar' || title === 'decision';
}

export function getDecisionTypeLabel(value = '') {
  switch (String(value || '').trim()) {
    case 'management-board':
      return 'Yönetim Kurulu';
    case 'audit-board':
      return 'Denetleme Kurulu';
    case 'honor-board':
      return 'Onur Kurulu';
    case 'work-group':
      return 'Çalışma Grubu';
    default:
      return 'Karar';
  }
}

export function getDecisionDisplayTitle(decision = {}) {
  const rawTitle = String(decision?.title || '').trim();
  if (!isGenericDecisionTitle(rawTitle)) {
    return rawTitle;
  }

  const parts = [];
  const categoryName = normalizeDecisionCategoryName(decision?.decisionCategory?.name || '');

  if (categoryName) {
    parts.push(categoryName);
  } else {
    parts.push(getDecisionTypeLabel(decision?.decisionType));
  }

  if (decision?.period?.name) {
    parts.push(decision.period.name);
  }

  if (decision?.meetingNo) {
    parts.push(`${decision.meetingNo}. Toplantı`);
  }

  return parts.join(' - ');
}
