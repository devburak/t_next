import {
  buildCalendarICS,
  calendarDay,
  loadCalendarEvents,
  parseCalendarRoute,
} from '../../../lib/calendar.mjs';
import { getApiBaseUrl, getSiteUrl } from '../../../lib/seo';
export default async function handler(req, res) {
  if (!['GET', 'HEAD'].includes(req.method)) {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).end();
  }
  const { startDate, endDate } = req.query;
  if (
    typeof startDate !== 'string' ||
    typeof endDate !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(startDate) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(endDate) ||
    !parseCalendarRoute(startDate.split('-')) ||
    !parseCalendarRoute(endDate.split('-'))
  )
    return res.status(400).json({ message: 'Geçerli bir tarih aralığı seçin.' });
  const start = calendarDay(startDate).startOf('day'),
    end = calendarDay(endDate).endOf('day');
  if (end.isBefore(start) || end.startOf('day').diff(start, 'day') + 1 > 366)
    return res.status(400).json({ message: 'En fazla bir yıllık aralık seçin.' });
  try {
    const events = await loadCalendarEvents(
      getApiBaseUrl(),
      { startDate: start.toISOString(), endDate: end.toISOString() },
      { signal: AbortSignal.timeout(20000) }
    );
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=tmmob-etkinlikler.ics');
    res.setHeader('Cache-Control', 'no-store');
    const content = buildCalendarICS(events, getSiteUrl());
    return req.method === 'HEAD' ? res.status(200).end() : res.status(200).send(content);
  } catch {
    return res.status(502).json({ message: 'Takvim dosyası alınamadı. Lütfen tekrar deneyin.' });
  }
}
