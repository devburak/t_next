import { Box, Typography } from '@mui/material';
import { calendarDay, eventsOnDay } from '../../lib/calendar.mjs';
import EventList from './EventList';
export default function DailyView({ selectedDate, events = [], onEventClick }) {
  const day = calendarDay(selectedDate),
    items = eventsOnDay(events, day);
  return (
    <Box sx={{ px: { xs: 2, sm: 0 } }}>
      <Typography component="h2" sx={{ m: 0, mb: 2, fontSize: '20px !important', fontWeight: 700 }}>
        {day.format('D MMMM YYYY, dddd')}
      </Typography>
      {items.length ? (
        <EventList events={items} onEventClick={onEventClick} />
      ) : (
        <Box sx={{ p: 4, textAlign: 'center', bgcolor: 'var(--calendar-muted)', borderRadius: 3 }}>
          <Typography component="div" color="text.secondary">
            Bu gün için etkinlik bulunmuyor.
          </Typography>
        </Box>
      )}
    </Box>
  );
}
