// components/DailyView.js
import React from 'react';
import { Grid, Box, Typography } from '@mui/material';

const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

const DailyView = ({ selectedDate, events = [] }) => {
  // selectedDate'in bir Date nesnesi olduğundan emin olun
  const validDate = selectedDate instanceof Date ? selectedDate : new Date(selectedDate);
  
  const filteredEvents = events.filter(event => {
    const eventDate = new Date(event.startDate);
    return (
      eventDate instanceof Date &&
      !isNaN(eventDate) &&
      eventDate.getFullYear() === validDate.getFullYear() &&
      eventDate.getMonth() === validDate.getMonth() &&
      eventDate.getDate() === validDate.getDate()
    );
  });

  return (
    <Grid container sx={{ height: '100vh' }}>
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

      {/* Etkinlikler - Sağ taraf */}
      <Grid item xs={11}>
        <Box sx={{ position: 'relative', height: '100%', paddingTop: 2 }}>
          {filteredEvents.map(event => {
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
    </Grid>
  );
};

export default DailyView;
