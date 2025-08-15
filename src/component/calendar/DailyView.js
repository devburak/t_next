// components/DailyView.js
import React from 'react';
import { Grid, Box, Typography, Tooltip } from '@mui/material';
import dayjs from 'dayjs';
import { useRouter } from 'next/router';
const typeColorMap = {
  meeting: { bg: '#E3F2FD', text: '#0D47A1', border: '#90CAF9' },
  webinar: { bg: '#E8F5E9', text: '#1B5E20', border: '#A5D6A7' },
  training: { bg: '#FFF8E1', text: '#E65100', border: '#FFE082' },
  workshop: { bg: '#F3E5F5', text: '#4A148C', border: '#CE93D8' },
  conference: { bg: '#E0F7FA', text: '#006064', border: '#80DEEA' },
  default: { bg: '#ECEFF1', text: '#263238', border: '#CFD8DC' },
};
const getTypeColors = (type) => typeColorMap[type] || typeColorMap.default;


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
            const colors = getTypeColors(event.eventType);
            const tooltip = `${event.title}${event.spot ? ' — ' + event.spot : ''}`;
            // Başlangıç dakikasını da hesaba katmak isterseniz: const startMinute = eventStart.minute();
            // Örnek: top: startHour * 60 + startMinute

            return (
              <Tooltip key={event._id} title={tooltip} arrow>
                <Box
                  onClick={() => handleClick(event._id)}
                  sx={{
                    position: 'absolute',
                    top: startHour * 60, // 1 saat = 60px
                    left: 0,
                    right: 0,
                    bgcolor: colors.bg,
                    color: colors.text,
                    border: `1px solid ${colors.border}`,
                    padding: 1,
                    borderRadius: 1,
                    margin: '5px 0',
                    fontSize: 12,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {event.title}
                </Box>
              </Tooltip>
            );
          })}
        </Box>
      </Grid>
    </Grid>
  );
};

export default DailyView;
