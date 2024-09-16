// components/WeeklyView.js
import React from 'react';
import { Grid, Box, Typography } from '@mui/material';
import dayjs from 'dayjs';

const daysOfWeek = ['PZT', 'SAL', 'ÇAR', 'PER', 'CUM', 'CMT', 'PAZ'];
const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

const WeeklyView = ({ selectedDate, events = [] }) => {
  // selectedDate'in bir Date nesnesi olduğundan emin olun
  const validDate = selectedDate instanceof Date ? selectedDate : new Date(selectedDate);

  const startOfWeek = dayjs(validDate).startOf('week').add(1, 'day'); // Pazartesiden başla
  const weekDays = Array.from({ length: 7 }, (_, i) => startOfWeek.add(i, 'day'));

  const filteredEvents = events.filter(event => {
    const eventDate = new Date(event.startDate);
    return weekDays.some(
      day =>
        eventDate instanceof Date &&
        !isNaN(eventDate) &&
        eventDate.getFullYear() === day.year() &&
        eventDate.getMonth() === day.month() &&
        eventDate.getDate() === day.date()
    );
  });

  return (
    <Grid container sx={{ height: '100vh' }}>
      {/* Günler - Üstte */}
      <Grid item xs={12} container>
        <Grid item xs={1} />
        {weekDays.map(day => (
          <Grid item xs={11 / 7} key={day.toString()} sx={{ borderBottom: '1px solid #ddd' }}>
            <Typography variant="h6" sx={{ textAlign: 'center', padding: 1 }}>
              {daysOfWeek[day.day() - 1]} {day.format('DD')}
            </Typography>
          </Grid>
        ))}
      </Grid>

      {/* Saatler ve Etkinlikler - Izgara Yapısı */}
      <Grid item xs={12} container>
        {/* Saatler - Sol taraf */}
        <Grid item xs={1}>
          <Box sx={{ borderRight: '1px solid #ddd', height: '100%', paddingTop: 2 }}>
            {hours.map(hour => (
              <Typography key={hour} sx={{ textAlign: 'right', paddingRight: 1, height: 60 }}>
                {hour}
              </Typography>
            ))}
          </Box>
        </Grid>

        {/* Günlük Etkinlikler - Sağ taraf */}
        {weekDays.map(day => (
          <Grid item xs={11 / 7} key={day.toString()} sx={{ borderRight: '1px solid #ddd' }}>
            <Box sx={{ position: 'relative', height: '100%', paddingTop: 2 }}>
              {filteredEvents
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
                .map(event => {
                  const startHour = new Date(event.startDate).getHours();
                  return (
                    <Box
                      key={event._id}
                      sx={{
                        position: 'absolute',
                        top: startHour * 60,
                        left: 0,
                        right: 0,
                        bgcolor: 'purple',
                        color: 'white',
                        padding: 1,
                        borderRadius: 1,
                        margin: '5px 0',
                      }}
                    >
                      {event.title}
                    </Box>
                  );
                })}
            </Box>
          </Grid>
        ))}
      </Grid>
    </Grid>
  );
};

export default WeeklyView;
