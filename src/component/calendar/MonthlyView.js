// components/MonthlyView.js
import React from 'react';
import { Grid, Box, Typography } from '@mui/material';
import dayjs from 'dayjs';

const daysOfWeek = ['PZT', 'SAL', 'ÇAR', 'PER', 'CUM', 'CMT', 'PAZ'];

const MonthlyView = ({ selectedDate, events = [] }) => {
  // selectedDate'in bir Date nesnesi olduğundan emin olun
  const validDate = selectedDate instanceof Date ? selectedDate : new Date(selectedDate);

  const startOfMonth = dayjs(validDate).startOf('month');
  const endOfMonth = dayjs(validDate).endOf('month');
  const startOfWeek = startOfMonth.startOf('week').add(1, 'day'); // Pazartesiden başla
  const totalDays = endOfMonth.diff(startOfWeek, 'day') + 1;

  const daysArray = Array.from({ length: totalDays }, (_, i) => startOfWeek.add(i, 'day'));

  return (
    <Grid container spacing={1}>
      {/* Günler - Üstte */}
      {daysOfWeek.map(day => (
        <Grid item xs={12 / 7} key={day}>
          <Typography variant="h6" sx={{ textAlign: 'center' }}>
            {day}
          </Typography>
        </Grid>
      ))}

      {/* Günlük Etkinlikler - Izgara Yapısı */}
      {daysArray.map(day => (
        <Grid item xs={12 / 7} key={day.toString()} sx={{ border: '1px solid #ddd', minHeight: 100 }}>
          <Typography variant="subtitle2" sx={{ textAlign: 'center', padding: 1 }}>
            {day.date()}
          </Typography>
          {events
            .filter(event => {
              const eventDate = new Date(event.startDate);
              return (
                eventDate instanceof Date &&
                !isNaN(eventDate) &&
                eventDate.getFullYear() === day.year() &&
                eventDate.getMonth() === day.month() &&
                eventDate.getDate() === day.date()
              );
            })
            .map(event => (
              <Box
                key={event._id}
                sx={{
                  bgcolor: 'purple',
                  color: 'white',
                  padding: 0.5,
                  borderRadius: 1,
                  marginBottom: 0.5,
                  textAlign: 'center',
                }}
              >
                {event.title}
              </Box>
            ))}
        </Grid>
      ))}
    </Grid>
  );
};

export default MonthlyView;
