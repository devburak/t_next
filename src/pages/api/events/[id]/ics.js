import { buildCalendarICS } from '../../../../lib/calendar.mjs';
import { getApiBaseUrl, getSiteUrl } from '../../../../lib/seo';
export default async function handler(req, res) {
  if (!['GET', 'HEAD'].includes(req.method)) {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).end();
  }
  const id = req.query.id;
  if (typeof id !== 'string' || !/^[a-f0-9]{24}$/i.test(id))
    return res.status(400).json({ message: 'Geçersiz etkinlik.' });
  try {
    const response = await fetch(`${getApiBaseUrl()}/events/${id}`, {
      signal: AbortSignal.timeout(15000),
    });
    if (response.status === 404) return res.status(404).json({ message: 'Etkinlik bulunamadı.' });
    if (!response.ok) throw new Error('upstream');
    const event = await response.json();
    if (String(event._id).toLowerCase() !== id.toLowerCase()) throw new Error('event');
    const ics = buildCalendarICS([event], getSiteUrl());
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=tmmob-etkinlik-${id}.ics`);
    res.setHeader('Cache-Control', 'no-store');
    return req.method === 'HEAD' ? res.status(200).end() : res.status(200).send(ics);
  } catch {
    return res.status(502).json({ message: 'Takvim dosyası alınamadı. Lütfen tekrar deneyin.' });
  }
}
