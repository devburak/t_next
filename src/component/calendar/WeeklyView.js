import { Box, Typography } from '@mui/material';
import { calendarDay, eventsOnDay } from '../../lib/calendar.mjs';
import EventList from './EventList';
export default function WeeklyView({ selectedDate, events = [], onEventClick }) {
  const day = calendarDay(selectedDate),
    start = day.subtract((day.day() + 6) % 7, 'day');
  return (
    <Box sx={{ display: 'grid', gap: 3, px: { xs: 2, sm: 0 } }}>
      {Array.from({ length: 7 }, (_, i) => start.add(i, 'day')).map((date) => {
        const items = eventsOnDay(events, date);
        return (
          <Box
            key={date.format('YYYY-MM-DD')}
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '140px minmax(0,1fr)' },
              gap: 2,
              pb: 3,
              borderBottom: '1px solid var(--calendar-border)',
            }}
          >
            <Box>
              <Typography
                component="h3"
                sx={{ m: 0, fontSize: '18px !important', fontWeight: 700 }}
              >
                {date.format('D MMMM')}
              </Typography>
              <Typography component="div" color="text.secondary" sx={{ fontSize: 13 }}>
                {date.format('dddd')}
              </Typography>
            </Box>
            {items.length ? (
              <EventList events={items} onEventClick={onEventClick} />
            ) : (
              <Typography component="div" sx={{ fontSize: 14, color: 'text.secondary', py: 1 }}>
                Etkinlik bulunmuyor.
              </Typography>
            )}
          </Box>
        );
      })}
    </Box>
  );
}
