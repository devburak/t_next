import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildCalendarICS,
  calendarRange,
  eventsOnDay,
  formatEventTime,
  googleCalendarUrl,
  loadCalendarEvents,
  parseCalendarRoute,
} from '../src/lib/calendar.mjs';
const event = {
  _id: '000000000000000000000001',
  title: 'Türkçe toplantı; tasarım, saat & konum',
  startDate: '2026-11-10T07:15:00.000Z',
  endDate: '2026-11-10T08:45:00.000Z',
  location: 'Ankara & çevrimiçi',
  spot: '<p>Birlikte &amp; açık</p>',
};
test('Google bağlantısı zamanı, konumu ve Türkçe metni kayıpsız taşır', () => {
  const url = new URL(googleCalendarUrl(event, 'https://new.example'));
  assert.equal(url.origin, 'https://calendar.google.com');
  assert.equal(url.pathname, '/calendar/r/eventedit');
  assert.equal(url.searchParams.get('dates'), '20261110T071500Z/20261110T084500Z');
  assert.equal(url.searchParams.get('stz'), 'Europe/Istanbul');
  assert.equal(url.searchParams.get('text'), event.title);
  assert.equal(url.searchParams.get('location'), event.location);
  assert.equal(
    url.searchParams.get('details'),
    'Birlikte & açık\n\nhttps://new.example/etkinlik/' + event._id
  );
  assert.equal(formatEventTime(event), '10:15 – 11:45');
});
test('gece yarısı ve günler arası etkinlikler Türkiye takviminde doğru günlere gelir', () => {
  const midnight = { ...event, startDate: '2026-11-09T21:30:00Z', endDate: null };
  const multi = {
    ...event,
    _id: '2',
    startDate: '2026-11-08T12:00:00Z',
    endDate: '2026-11-12T12:00:00Z',
  };
  assert.equal(eventsOnDay([midnight], '2026-11-09').length, 0);
  assert.equal(eventsOnDay([midnight, multi], '2026-11-10').length, 2);
  assert.equal(eventsOnDay([multi], '2026-11-13').length, 0);
  assert.equal(eventsOnDay([{ startDate: 'bad' }], '2026-11-10').length, 0);
});
test('Pazar haftanın sonudur; aylık aralık son günün tamamını içerir', () => {
  assert.deepEqual(calendarRange('2026-11-15', 'weekly'), {
    startDate: '2026-11-08T21:00:00.000Z',
    endDate: '2026-11-15T20:59:59.999Z',
  });
  assert.deepEqual(calendarRange('2026-11-16', 'monthly'), {
    startDate: '2026-10-31T21:00:00.000Z',
    endDate: '2026-11-30T20:59:59.999Z',
  });
});
test('ICS UTC zamanları, UTF8 satır katlama ve güvenli metin kaçışlarını korur', () => {
  const e = {
    ...event,
    title: 'Mühendislik, tasarım; '.repeat(12) + '\r\nBEGIN:VEVENT',
    spot: 'Satır1\nSatır2; , \\',
  };
  const ics = buildCalendarICS([e], 'https://new.example', new Date('2026-01-01T00:00:00Z'));
  for (const line of ics.split('\r\n')) assert(Buffer.byteLength(line, 'utf8') <= 75);
  const unfolded = ics.replace(/\r\n /g, '');
  assert(unfolded.includes('DTSTART:20261110T071500Z'));
  assert(unfolded.includes('DTEND:20261110T084500Z'));
  assert.equal(unfolded.split('\r\n').filter((l) => l === 'BEGIN:VEVENT').length, 1);
  assert(unfolded.includes('\\nBEGIN:VEVENT'));
  assert(unfolded.includes('\\,'));
  assert(unfolded.includes('\\;'));
  assert(unfolded.endsWith('END:VCALENDAR\r\n'));
});
test('bitiş saati eksikse Google ve ICS aynı bir saatlik taslağı açar', () => {
  const e = { ...event, endDate: null };
  assert(new URL(googleCalendarUrl(e)).searchParams.get('dates').endsWith('/20261110T081500Z'));
  assert(buildCalendarICS([e]).includes('DTEND:20261110T081500Z'));
  assert.equal(googleCalendarUrl({ ...event, startDate: 'invalid' }), '');
});
test('bütün sayfalar alınır, tekrarlar elenir ve istek iptali taşınır', async (t) => {
  const requests = [];
  const controller = new AbortController();
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    requests.push({ url: new URL(url), options });
    return {
      ok: true,
      json: async () => ({
        events: requests.length === 1 ? [event] : [event, { ...event, _id: '2' }],
        totalPages: 2,
      }),
    };
  });
  const result = await loadCalendarEvents('https://api.example/api', calendarRange('2026-11-16'), {
    signal: controller.signal,
  });
  assert.equal(result.length, 2);
  assert.equal(requests.length, 2);
  assert.equal(requests[1].url.searchParams.get('page'), '2');
  assert.equal(requests[0].url.searchParams.get('limit'), '100');
  assert.equal(requests[0].options.signal, controller.signal);
});
test('hatalı API yanıtı boş takvim gibi sunulmaz', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => ({ ok: false, status: 403 }));
  await assert.rejects(loadCalendarEvents('https://api.example/api', {}), /erişilemiyor/);
});
test('geçersiz tarih ve yol reddedilir; ay/gün/hafta modları doğru çözülür', () => {
  const now = new Date('2026-11-16T10:00:00Z');
  assert.equal(parseCalendarRoute(['2026', '11'], '', now).date.format('YYYY-MM-DD'), '2026-11-16');
  assert.equal(parseCalendarRoute(['2026', '11', '15'], 'weekly', now).view, 'weekly');
  for (const parts of [['2026', '02', '30'], ['2026', '13'], ['x'], ['2026', '11', '1', '2']])
    assert.equal(parseCalendarRoute(parts, '', now), null);
});

test('bağlantı hatası teknik hata metni yerine yeniden deneme mesajı verir',async t=>{
 t.mock.method(globalThis,'fetch',async()=>{throw new TypeError('Failed to fetch');});
 await assert.rejects(loadCalendarEvents('https://api.example/api',{}),/Lütfen tekrar deneyin/);
});
