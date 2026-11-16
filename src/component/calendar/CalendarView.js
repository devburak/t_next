import React, { useState } from 'react';
import { Box, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { calendarDay, eventsOnDay } from '../../lib/calendar.mjs';
import DailyView from './DailyView';
import WeeklyView from './WeeklyView';
import MonthlyView from './MonthlyView';
import EventDialog from './EventDialog';
import { calendarUiSx } from './calendarStyles';
export default function CalendarView({
  events = [],
  initialView = 'monthly',
  selectedDate,
  setView,
  onDateChange = () => {},
}) {
  const [internalView, setInternalView] = useState(initialView);
  const [dialog, setDialog] = useState({ events: [], date: null });
  const view = setView ? initialView : internalView;
  const eventClick = (event) => setDialog({ events: [event], date: event.startDate });
  const dayClick = (date) => {
    onDateChange(calendarDay(date));
    const matches = eventsOnDay(events, date);
    if (matches.length) setDialog({ events: matches, date });
  };
  return (
    <Box sx={calendarUiSx}>
      <ToggleButtonGroup
        exclusive
        value={view}
        onChange={(event, value) => {
          if (value) (setView || setInternalView)(value);
        }}
        aria-label="Takvim görünümü"
        sx={{
          mb: 3,
          display: 'flex',
          '& .MuiToggleButton-root': {
            minHeight: 44,
            flex: 1,
            fontSize: 14,
            textTransform: 'none',
            fontWeight: 600,
          },
        }}
      >
        <ToggleButton value="monthly">Ay</ToggleButton>
        <ToggleButton value="weekly">Hafta</ToggleButton>
        <ToggleButton value="daily">Gün</ToggleButton>
      </ToggleButtonGroup>
      {view === 'monthly' && (
        <MonthlyView
          selectedDate={selectedDate}
          events={events}
          onEventClick={eventClick}
          onDayClick={dayClick}
        />
      )}
      {view === 'weekly' && (
        <WeeklyView selectedDate={selectedDate} events={events} onEventClick={eventClick} />
      )}
      {view === 'daily' && (
        <DailyView selectedDate={selectedDate} events={events} onEventClick={eventClick} />
      )}
      <EventDialog
        events={dialog.events}
        date={dialog.date}
        onClose={() => setDialog({ events: [], date: null })}
      />
    </Box>
  );
}
