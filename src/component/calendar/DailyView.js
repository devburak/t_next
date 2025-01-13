// components/DailyView.js
import React from 'react';
import { Grid, Box, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { useRouter } from 'next/router';

const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

const DailyView = ({ selectedDate, events = [] }) => {
    const router = useRouter();

  // Seçilen tarihi dayjs ile parse ediyoruz
  // .startOf('day') kullanarak günü sabitliyoruz (saat:00:00)
  const day = dayjs(selectedDate).isValid() ? dayjs(selectedDate).startOf('day') : dayjs().startOf('day');

  // O güne ait etkinlikleri filtrele
  const filteredEvents = events.filter((event) => {
    const eventStart = dayjs(event.startDate);
    // Etkinliğin başlangıç tarihi "day" ile aynı gün mü?
    return eventStart.isSame(day, 'day');
  });

  const handleClick = (eventId) => {
    router.push(`/etkinlik/${eventId}`);
  };
  return (
    <Grid container sx={{ height: '100vh' }}>
      {/* Sol Tarafta Saatler */}
      <Grid item xs={1}>
        <Box sx={{ borderRight: '1px solid #ddd', height: '100%', paddingTop: 2 }}>
          {hours.map((hour) => (
            <Typography
              key={hour}
              sx={{
                textAlign: 'right',
                paddingRight: 1,
                height: 60,  // 1 saat = 60px
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end'
              }}
            >
              {hour}
            </Typography>
          ))}
        </Box>
      </Grid>

      {/* Sağ Tarafta Etkinlikler */}
      <Grid item xs={11}>
        <Box sx={{ position: 'relative', height: '100%', paddingTop: 2 }}>
          {/* Etkinlikleri listele */}
          {filteredEvents.map((event) => {
            const eventStart = dayjs(event.startDate);
            const startHour = eventStart.hour(); // 0-23
            // Başlangıç dakikasını da hesaba katmak isterseniz: const startMinute = eventStart.minute();
            // Örnek: top: startHour * 60 + startMinute

            return (
              <Box
                key={event._id}
                onClick={() => handleClick(event._id)}
                sx={{
                  position: 'absolute',
                  top: startHour * 60, // 1 saat = 60px
                  left: 0,
                  right: 0,
                  bgcolor: 'purple',
                  color: 'white',
                  padding: 1,
                  borderRadius: 1,
                  margin: '5px 0',
                  fontSize: 12
                  
                  // height: 20, // Sadece bir satır görünmesini isterseniz sabit küçük bir yükseklik verebilirsiniz
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
