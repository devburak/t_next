import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import 'dayjs/locale/tr.js';

dayjs.extend(utc);
dayjs.extend(timezone);
export const CALENDAR_ZONE = 'Europe/Istanbul';
export const eventInstant = (value) => {
  const date = value ? dayjs(value) : null;
  return date?.isValid() ? date.tz(CALENDAR_ZONE).locale('tr') : null;
};
export function calendarDay(value = new Date()) {
  if (value instanceof Date)
    return dayjs
      .tz(
        `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`,
        CALENDAR_ZONE
      )
      .locale('tr');
  const text = typeof value === 'string' ? value.slice(0, 10) : value.format('YYYY-MM-DD');
  return dayjs.tz(text, CALENDAR_ZONE).locale('tr');
}
export function eventRange(event) {
  const start = eventInstant(event?.startDate);
  if (!start?.isValid()) return null;
  const rawEnd = eventInstant(event?.endDate);
  const end = rawEnd?.isValid() && !rawEnd.isBefore(start) ? rawEnd : start;
  return { start, end, hasEnd: Boolean(rawEnd?.isValid() && rawEnd.isAfter(start)) };
}
export function eventsOnDay(events, value) {
  const day = calendarDay(value),
    start = day.startOf('day'),
    end = day.endOf('day');
  return (events || [])
    .filter((event) => {
      const range = eventRange(event);
      return range && !range.start.isAfter(end) && !range.end.isBefore(start);
    })
    .sort(
      (a, b) =>
        new Date(a.startDate) - new Date(b.startDate) || String(a._id).localeCompare(String(b._id))
    );
}
export const dayHref = (value) => `/takvim/${calendarDay(value).format('YYYY/MM/DD')}`;
export const eventHref = (event) => `/etkinlik/${encodeURIComponent(event._id)}`;
export const eventTypeLabel = (event) =>
  event?.eventType && typeof event.eventType === 'object'
    ? event.eventType.name || 'Etkinlik'
    : {
        meeting: 'Toplantı',
        webinar: 'Çevrimiçi etkinlik',
        training: 'Eğitim',
        workshop: 'Atölye',
        conference: 'Konferans',
      }[event?.eventType] ||
      event?.eventType ||
      'Etkinlik';
export function formatEventDate(event) {
  const range = eventRange(event);
  if (!range) return 'Tarih belirtilmemiş';
  return range.start.isSame(range.end, 'day')
    ? range.start.format('D MMMM YYYY, dddd')
    : `${range.start.format('D MMMM YYYY')} – ${range.end.format('D MMMM YYYY')}`;
}
export function formatEventTime(event) {
  const range = eventRange(event);
  if (!range) return 'Saat belirtilmemiş';
  return `${range.start.format('HH:mm')}${range.hasEnd ? ` – ${range.end.isSame(range.start, 'day') ? '' : range.end.format('D MMM ')}${range.end.format('HH:mm')}` : ''}`;
}
export function calendarRange(value, view = 'monthly') {
  const day = calendarDay(value);
  const start =
    view === 'weekly'
      ? day.startOf('day').subtract((day.day() + 6) % 7, 'day')
      : day.startOf(view === 'daily' ? 'day' : 'month');
  const end =
    view === 'weekly'
      ? start.add(6, 'day').endOf('day')
      : day.endOf(view === 'daily' ? 'day' : 'month');
  return { startDate: start.toISOString(), endDate: end.toISOString() };
}
export async function loadCalendarEvents(baseUrl, range, { signal } = {}) {
  const items = new Map();
  let page = 1,
    totalPages = 1;
  do {
    const query = new URLSearchParams({
      ...range,
      page: String(page),
      limit: '100',
      sort: 'asc',
      summary: 'true',
    });
    let response;
    try {
      response = await fetch(`${baseUrl}/events/list?${query}`, { signal });
    } catch (error) {
      if (error.name === 'AbortError') throw error;
      throw new Error('Etkinlikler yüklenemedi. Lütfen tekrar deneyin.');
    }
    if (!response.ok)
      throw new Error(
        response.status === 401 || response.status === 403
          ? 'Etkinliklere erişilemiyor.'
          : 'Etkinlikler yüklenemedi.'
      );
    let data;
    try {
      data = await response.json();
    } catch {
      throw new Error('Etkinlikler yüklenemedi. Lütfen tekrar deneyin.');
    }
    if (!Array.isArray(data.events)) throw new Error('Etkinlikler yüklenemedi.');
    for (const event of data.events)
      if (event?._id && eventRange(event)) items.set(event._id, event);
    totalPages = Math.max(1, Number(data.totalPages) || 1);
    if (totalPages > 100) throw new Error('Daha kısa bir tarih aralığı seçin.');
    page++;
  } while (page <= totalPages);
  return [...items.values()];
}
function plainText(value = '') {
  return String(value)
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}
function exportRange(event) {
  const range = eventRange(event);
  if (!range) return null;
  return { start: range.start, end: range.hasEnd ? range.end : range.start.add(1, 'hour') };
}
const utcStamp = (value) => value.utc().format('YYYYMMDDTHHmmss[Z]');
export function googleCalendarUrl(event, siteUrl = '') {
  const range = exportRange(event);
  if (!range) return '';
  const details = [
    plainText(event.spot || event.bodyHtml).slice(0, 1800),
    siteUrl ? siteUrl.replace(/\/$/, '') + eventHref(event) : '',
  ]
    .filter(Boolean)
    .join('\n\n');
  const query = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title || 'TMMOB Etkinliği',
    dates: `${utcStamp(range.start)}/${utcStamp(range.end)}`,
    stz: CALENDAR_ZONE,
    etz: CALENDAR_ZONE,
    details,
    location: event.location || '',
  });
  return 'https://calendar.google.com/calendar/r/eventedit?' + query;
}
const escapeICS = (value) =>
  String(value || '')
    .replace(/\\/g, '\\\\')
    .replace(/\r\n|\r|\n/g, '\\n')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,');
function foldLine(line) {
  const encoder = new TextEncoder();
  let current = '',
    output = [],
    size = 0;
  for (const character of line) {
    const bytes = encoder.encode(character).length;
    if (size + bytes > 75) {
      output.push(current);
      current = ' ';
      size = 1;
    }
    current += character;
    size += bytes;
  }
  output.push(current);
  return output.join('\r\n');
}
export function buildCalendarICS(events, siteUrl = '', now = new Date()) {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//TMMOB//Etkinlik Takvimi//TR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];
  for (const event of events) {
    const range = exportRange(event);
    if (!range) continue;
    lines.push(
      'BEGIN:VEVENT',
      `UID:${escapeICS(event._id)}@tmmob.org.tr`,
      `DTSTAMP:${utcStamp(dayjs(now))}`,
      `DTSTART:${utcStamp(range.start)}`,
      `DTEND:${utcStamp(range.end)}`,
      `SUMMARY:${escapeICS(event.title)}`,
      `DESCRIPTION:${escapeICS(plainText(event.spot || event.bodyHtml))}`,
      `LOCATION:${escapeICS(event.location)}`
    );
    if (siteUrl) lines.push(`URL:${escapeICS(siteUrl.replace(/\/$/, '') + eventHref(event))}`);
    lines.push('END:VEVENT');
  }
  return [...lines, 'END:VCALENDAR'].map(foldLine).join('\r\n') + '\r\n';
}

export function parseCalendarRoute(parts = [], view = '', now = new Date()) {
  if (!Array.isArray(parts) || parts.length > 3 || parts.some((value) => !/^\d+$/.test(value)))
    return null;
  const today = eventInstant(now),
    year = parts[0] ? Number(parts[0]) : today.year();
  const month = parts[1] ? Number(parts[1]) : parts.length ? 1 : today.month() + 1;
  const day = parts[2]
    ? Number(parts[2])
    : year === today.year() && month === today.month() + 1
      ? today.date()
      : 1;
  if (year < 1900 || year > 2199 || month < 1 || month > 12 || day < 1 || day > 31) return null;
  const key = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const date = calendarDay(key);
  if (!date.isValid() || date.format('YYYY-MM-DD') !== key) return null;
  return { date, view: view === 'weekly' ? 'weekly' : parts.length === 3 ? 'daily' : 'monthly' };
}
export const calendarToday = () => eventInstant(new Date()).startOf('day');
export const nativeCalendarDate = (date) => {
  const day = calendarDay(date);
  return new Date(day.year(), day.month(), day.date());
};
