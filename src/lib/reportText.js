function normalizeReportCategoryName(value = '') {
  const name = String(value || '').trim();
  if (!name) {
    return '';
  }

  return name
    .replace(/Raporları$/i, 'Raporu')
    .replace(/Raporlari$/i, 'Raporu')
    .trim();
}

function isGenericReportTitle(value = '') {
  const title = String(value || '').trim().toLowerCase();
  return !title || title === 'rapor' || title === 'report';
}

export function getReportDisplayTitle(report = {}) {
  const rawTitle = String(report?.title || '').trim();
  if (!isGenericReportTitle(rawTitle)) {
    return rawTitle;
  }

  const parts = [];
  const categoryName = normalizeReportCategoryName(report?.reportCategory?.name || '');

  if (categoryName) {
    parts.push(categoryName);
  } else {
    parts.push('Rapor');
  }

  if (report?.period?.name) {
    parts.push(report.period.name);
  }

  if (report?.meetingNo) {
    parts.push(`${report.meetingNo}. Toplantı`);
  }

  return parts.join(' - ');
}
