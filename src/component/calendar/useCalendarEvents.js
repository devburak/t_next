import { useEffect, useMemo, useRef, useState } from 'react';
import { calendarDay, calendarRange, loadCalendarEvents } from '../../lib/calendar.mjs';

export default function useCalendarEvents(
  date,
  view = 'monthly',
  { externalEvents, initialEvents, initialError } = {}
) {
  const dayKey = calendarDay(date).format('YYYY-MM-DD');
  const range = useMemo(() => calendarRange(dayKey, view), [dayKey, view]);
  const [retryKey, setRetryKey] = useState(0);
  const key = `${range.startDate}/${range.endDate}/${retryKey}`;
  const [result, setResult] = useState(() => ({
    key,
    status: initialError ? 'error' : initialEvents ? 'ready' : 'loading',
    events: initialEvents || [],
    error: initialError || '',
  }));
  const first = useRef(true);
  useEffect(() => {
    if (Array.isArray(externalEvents)) return;
    if (first.current && initialEvents && !initialError) {
      first.current = false;
      return;
    }
    first.current = false;
    const controller = new AbortController();
    loadCalendarEvents(process.env.NEXT_PUBLIC_API_BASE_URL, range, { signal: controller.signal })
      .then((events) => {
        setResult({ key, events, status: 'ready', error: '' });
      })
      .catch((error) => {
        if (error.name !== 'AbortError')
          setResult({ key, events: [], status: 'error', error: error.message });
      });
    return () => controller.abort();
  }, [externalEvents, initialEvents, initialError, key, range]);
  const controlled = Array.isArray(externalEvents);
  return {
    events: controlled ? externalEvents : result.key === key ? result.events : [],
    loading: !controlled && (result.key !== key || result.status === 'loading'),
    error: controlled || result.key !== key ? '' : result.error,
    retry: () => setRetryKey((value) => value + 1),
  };
}
