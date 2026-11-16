import React, { useEffect, useId, useRef, useState } from 'react';
import { Box, Button, ButtonBase, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import ChevronLeftRounded from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRounded from '@mui/icons-material/ChevronRightRounded';
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  calendarDay,
  calendarToday,
  nativeCalendarDate,
  dayHref,
  eventsOnDay,
  formatEventTime,
} from '../../lib/calendar.mjs';
import { calendarUiSx } from './calendarStyles';
import CalendarStatus from './CalendarStatus';
import EventDialog from './EventDialog';
import useCalendarEvents from './useCalendarEvents';

const weekDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
export default function CustomCalendar({
  value,
  onChange,
  events: externalEvents,
  onMonthChange,
  loading: parentLoading = false,
  error: parentError = '',
  onRetry,
}) {
  const router = useRouter(),
    labelId = useId(),
    root = useRef(null),
    focusRequested = useRef(false);
  const [selected, setSelected] = useState(() => calendarDay(value || calendarToday()));
  const [visibleMonth, setVisibleMonth] = useState(null);
  const selectedDay = value ? calendarDay(value) : selected;
  const month = calendarDay(visibleMonth || selectedDay).startOf('month');
  const monthKey = month.format('YYYY-MM');
  const [focusDay, setFocusDay] = useState(() => selectedDay.format('YYYY-MM-DD'));
  const [dialog, setDialog] = useState({ events: [], date: null });
  const source = useCalendarEvents(month, 'monthly', { externalEvents });
  const { events } = source;
  const loading = parentLoading || source.loading;
  const error = parentError || source.error;
  const retry = onRetry || source.retry;
  const start = month.subtract((month.day() + 6) % 7, 'day');
  const days = Array.from({ length: 42 }, (_, index) => start.add(index, 'day'));
  useEffect(() => {
    if (focusRequested.current) {
      root.current?.querySelector(`[data-calendar-day="${focusDay}"]`)?.focus();
      focusRequested.current = false;
    }
  }, [focusDay, monthKey]);
  const navigate = (amount) => {
    const next = month.add(amount, 'month');
    setFocusDay(next.format('YYYY-MM-DD'));
    if (onMonthChange) onMonthChange(nativeCalendarDate(next));
    else setVisibleMonth(next);
  };
  const selectDay = (date) => {
    setSelected(date);
    setFocusDay(date.format('YYYY-MM-DD'));
    const matches = eventsOnDay(events, date);
    if (onChange) {
      onChange(nativeCalendarDate(date));
      return;
    }
    if (matches.length) setDialog({ events: matches, date });
    else if (!onChange) router.push(dayHref(date));
  };
  const keyboard = (event, date) => {
    const offsets = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
      ArrowDown: 7,
      Home: -(date.day() + 6) % 7,
      End: 6 - ((date.day() + 6) % 7),
    };
    if (!Object.hasOwn(offsets, event.key)) return;
    event.preventDefault();
    const next = date.add(offsets[event.key], 'day');
    focusRequested.current = true;
    setFocusDay(next.format('YYYY-MM-DD'));
    if (!next.isSame(month, 'month')) {
      if (onMonthChange) onMonthChange(nativeCalendarDate(next.startOf('month')));
      else setVisibleMonth(next.startOf('month'));
    }
  };
  return (
    <Box
      ref={root}
      data-calendar-mini
      sx={{
        ...calendarUiSx,
        bgcolor: 'var(--calendar-surface)',
        border: '1px solid var(--calendar-border)',
        borderRadius: 4,
        p: { xs: 0.5, sm: 1 },
        width: '100%',
        minWidth: 0,
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography
          id={labelId}
          component="h3"
          sx={{ m: 0, fontSize: '18px !important', fontWeight: 700 }}
        >
          {month.format('MMMM YYYY')}
        </Typography>
        <Stack direction="row">
          <IconButton
            aria-label="Önceki ay"
            onClick={() => navigate(-1)}
            sx={{ width: 44, height: 44 }}
          >
            <ChevronLeftRounded />
          </IconButton>
          <IconButton
            aria-label="Sonraki ay"
            onClick={() => navigate(1)}
            sx={{ width: 44, height: 44 }}
          >
            <ChevronRightRounded />
          </IconButton>
        </Stack>
      </Stack>
      <Box
        role="group"
        aria-labelledby={labelId}
        sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))' }}
      >
        {weekDays.map((day) => (
          <Typography
            key={day}
            component="div"
            sx={{
              textAlign: 'center',
              py: 1,
              fontSize: 12,
              fontWeight: 600,
              color: 'text.secondary',
            }}
          >
            {day}
          </Typography>
        ))}
        {days.map((day) => {
          const matches = eventsOnDay(events, day),
            key = day.format('YYYY-MM-DD'),
            today = day.isSame(calendarToday(), 'day');
          const button = (
            <ButtonBase
              data-calendar-day={key}
              aria-label={`${day.format('D MMMM YYYY, dddd')}, ${matches.length} etkinlik`}
              aria-current={today ? 'date' : undefined}
              aria-pressed={day.isSame(selectedDay, 'day')}
              tabIndex={key === focusDay ? 0 : -1}
              onKeyDown={(event) => keyboard(event, day)}
              onClick={() => selectDay(day)}
              sx={{
                minWidth: 0,
                width: '100%',
                minHeight: 48,
                borderRadius: 2,
                flexDirection: 'column',
                gap: 0.25,
                fontSize: 14,
                color: day.isSame(month, 'month') ? 'var(--calendar-ink)' : 'text.disabled',
                fontWeight: matches.length ? 700 : 400,
                bgcolor: today
                  ? 'var(--calendar-accent)'
                  : day.isSame(selectedDay, 'day')
                    ? 'var(--calendar-muted)'
                    : 'transparent',
                ...(today ? { color: '#fff' } : {}),
                '&:hover': { bgcolor: today ? 'var(--calendar-accent)' : 'var(--calendar-muted)' },
              }}
            >
              <Box component="span">{day.date()}</Box>
              <Stack component="span" direction="row" spacing={0.5} sx={{ height: 5 }}>
                {matches.slice(0, 3).map((item) => (
                  <Box
                    component="span"
                    key={item._id}
                    sx={{
                      width: 4,
                      height: 4,
                      borderRadius: '50%',
                      bgcolor: today ? 'currentColor' : 'var(--calendar-accent)',
                    }}
                  />
                ))}
              </Stack>
            </ButtonBase>
          );
          return matches.length ? (
            <Tooltip
              key={key}
              describeChild
              arrow
              placement="top"
              disableInteractive
              disableTouchListener
              title={
                <Box sx={{ maxWidth: 260, p: 0.5, overflowWrap: 'anywhere' }}>
                  <Typography component="div" sx={{ fontSize: 13, fontWeight: 700 }}>
                    {matches[0].title}
                  </Typography>
                  <Typography component="div" sx={{ fontSize: 12 }}>
                    {formatEventTime(matches[0])}
                    {matches.length > 1 ? ` · +${matches.length - 1} etkinlik` : ''}
                  </Typography>
                </Box>
              }
            >
              {button}
            </Tooltip>
          ) : (
            React.cloneElement(button, { key })
          );
        })}
      </Box>
      <Box sx={{ minHeight: 32, mt: 1 }}>
        <CalendarStatus loading={loading} error={error} onRetry={retry} compact />
        {!loading && !error && (
          <Typography
            component="div"
            variant="caption"
            color="text.secondary"
            sx={{ px: 1, mt: 1 }}
          >
            {events.length
              ? 'Noktalı günlere dokunarak etkinlikleri açın.'
              : 'Bu ay için etkinlik bulunmuyor.'}
          </Typography>
        )}
      </Box>
      <Button
        component={Link}
        href={`/takvim/${month.format('YYYY/MM')}`}
        endIcon={<ArrowForwardRounded />}
        sx={{ mt: 1, minHeight: 44, width: '100%', borderRadius: 2 }}
      >
        Tüm takvimi aç
      </Button>
      <EventDialog
        events={dialog.events}
        date={dialog.date}
        onClose={() => setDialog({ events: [], date: null })}
      />
    </Box>
  );
}
