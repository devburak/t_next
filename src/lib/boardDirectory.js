const TURKISH_CHAR_MAP = {
  ç: 'c',
  Ç: 'c',
  ğ: 'g',
  Ğ: 'g',
  ı: 'i',
  İ: 'i',
  ö: 'o',
  Ö: 'o',
  ş: 's',
  Ş: 's',
  ü: 'u',
  Ü: 'u',
};

const MAX_BOARD_PAGES = 100;
const BOARD_PAGE_LIMIT = 100;

function normalizeTurkishText(value = '') {
  return String(value)
    .split('')
    .map((char) => TURKISH_CHAR_MAP[char] || char)
    .join('');
}

export function slugifyText(value = '') {
  return normalizeTurkishText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getEntityId(entity) {
  if (!entity) {
    return '';
  }

  if (typeof entity === 'string') {
    return entity;
  }

  return String(entity._id || entity.id || '');
}

export function getEntityName(entity, fallback = '') {
  if (!entity) {
    return fallback;
  }

  if (typeof entity === 'string') {
    return entity;
  }

  return String(entity.name || entity.title || entity.label || fallback);
}

export function getChamberSlug(chamber) {
  const shortName = String(chamber?.short || '').trim();
  const chamberName = String(chamber?.name || '').trim();
  return slugifyText(shortName || chamberName);
}

async function fetchJson(url, fallbackValue) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return fallbackValue;
    }

    return await response.json();
  } catch (error) {
    console.error(`[BoardDirectory] Failed to fetch: ${url}`, error);
    return fallbackValue;
  }
}

async function fetchAllBoards(apiBaseUrl) {
  let page = 1;
  let totalPages = 1;
  const allBoards = [];

  while (page <= totalPages && page <= MAX_BOARD_PAGES) {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(BOARD_PAGE_LIMIT),
    });

    const payload = await fetchJson(`${apiBaseUrl}/boards?${params.toString()}`, {
      data: [],
      totalPages: 1,
    });

    const pageData = Array.isArray(payload?.data) ? payload.data : [];
    allBoards.push(...pageData);

    const nextTotalPages = Number(payload?.totalPages);
    totalPages = Number.isFinite(nextTotalPages) && nextTotalPages > 0 ? nextTotalPages : 1;
    page += 1;
  }

  return allBoards;
}

export async function fetchBoardDirectoryData(apiBaseUrl) {
  const [boards, boardTypesPayload, chambersPayload, periodsPayload] = await Promise.all([
    fetchAllBoards(apiBaseUrl),
    fetchJson(`${apiBaseUrl}/board-types`, []),
    fetchJson(`${apiBaseUrl}/chambers?page=1&limit=200`, { data: [] }),
    fetchJson(`${apiBaseUrl}/periods?page=1&pageSize=200`, { periods: [] }),
  ]);

  const boardTypes = Array.isArray(boardTypesPayload) ? boardTypesPayload : [];
  const chambers = Array.isArray(chambersPayload?.data) ? chambersPayload.data : [];
  const periods = Array.isArray(periodsPayload?.periods) ? periodsPayload.periods : [];

  return {
    boards,
    boardTypes,
    chambers,
    periods,
  };
}

export function getDefaultPeriodIdForBoards(periods = [], boards = []) {
  const boardPeriodIds = new Set(
    boards
      .map((board) => getEntityId(board?.period))
      .filter(Boolean)
  );

  if (boardPeriodIds.size > 0) {
    for (const period of periods) {
      const periodId = getEntityId(period);
      if (periodId && boardPeriodIds.has(periodId)) {
        return periodId;
      }
    }
  }

  return getEntityId(periods[0]);
}

export function normalizeFilterValue(value) {
  if (Array.isArray(value)) {
    return normalizeFilterValue(value[0]);
  }

  return typeof value === 'string' ? value.trim() : '';
}

export function filterBoards(boards = [], { periodId = '', typeId = '', chamberId = '' } = {}) {
  return boards.filter((board) => {
    if (periodId && getEntityId(board?.period) !== periodId) {
      return false;
    }

    if (typeId && getEntityId(board?.type) !== typeId) {
      return false;
    }

    if (chamberId && getEntityId(board?.chamber) !== chamberId) {
      return false;
    }

    return true;
  });
}

export function sortByLocalizedName(items = [], nameGetter = (item) => getEntityName(item, '')) {
  return [...items].sort((left, right) =>
    nameGetter(left).localeCompare(nameGetter(right), 'tr', { sensitivity: 'base' })
  );
}

export function sortBoardTypesByWeight(items = []) {
  return [...items].sort((left, right) => {
    const leftWeight = Number.parseInt(left?.sortWeight, 10);
    const rightWeight = Number.parseInt(right?.sortWeight, 10);
    const normalizedLeft = Number.isFinite(leftWeight) ? leftWeight : Number.MAX_SAFE_INTEGER;
    const normalizedRight = Number.isFinite(rightWeight) ? rightWeight : Number.MAX_SAFE_INTEGER;

    if (normalizedLeft !== normalizedRight) {
      return normalizedLeft - normalizedRight;
    }

    return getEntityName(left, '').localeCompare(getEntityName(right, ''), 'tr', { sensitivity: 'base' });
  });
}

function normalizeSortWeight(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : Number.MAX_SAFE_INTEGER;
}

export function sortBoardsForDisplay(boards = [], boardTypes = []) {
  const boardTypeWeightById = new Map();
  const boardTypeNameById = new Map();

  boardTypes.forEach((boardType) => {
    const typeId = getEntityId(boardType);
    if (!typeId) {
      return;
    }

    boardTypeWeightById.set(typeId, normalizeSortWeight(boardType?.sortWeight));
    boardTypeNameById.set(typeId, getEntityName(boardType, ''));
  });

  const resolveTypeWeight = (board) => {
    const inlineWeight = normalizeSortWeight(board?.type?.sortWeight);
    if (inlineWeight !== Number.MAX_SAFE_INTEGER) {
      return inlineWeight;
    }

    const typeId = getEntityId(board?.type);
    if (typeId && boardTypeWeightById.has(typeId)) {
      return boardTypeWeightById.get(typeId);
    }

    return Number.MAX_SAFE_INTEGER;
  };

  const resolveTypeName = (board) => {
    const inlineName = getEntityName(board?.type, '');
    if (inlineName) {
      return inlineName;
    }

    const typeId = getEntityId(board?.type);
    if (typeId && boardTypeNameById.has(typeId)) {
      return boardTypeNameById.get(typeId);
    }

    return '';
  };

  return [...boards].sort((left, right) => {
    const normalizedLeftTypeWeight = resolveTypeWeight(left);
    const normalizedRightTypeWeight = resolveTypeWeight(right);

    if (normalizedLeftTypeWeight !== normalizedRightTypeWeight) {
      return normalizedLeftTypeWeight - normalizedRightTypeWeight;
    }

    const typeDiff = resolveTypeName(left).localeCompare(
      resolveTypeName(right),
      'tr',
      { sensitivity: 'base' }
    );

    if (typeDiff !== 0) {
      return typeDiff;
    }

    return getEntityName(left, '').localeCompare(getEntityName(right, ''), 'tr', { sensitivity: 'base' });
  });
}
