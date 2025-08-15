import React from 'react';
import { Grid, Box, Typography, Tooltip } from '@mui/material';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';

// Gerekli plugin'leri import edip extend edebilirsiniz (opsiyonel):
// import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
// import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
// dayjs.extend(isSameOrAfter);
// dayjs.extend(isSameOrBefore);

const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
const daysOfWeek = ['PZT', 'SAL', 'ÇAR', 'PER', 'CUM', 'CMT', 'PAZ'];

const typeColorMap = {
  meeting: { bg: '#E3F2FD', text: '#0D47A1', border: '#90CAF9' },
  webinar: { bg: '#E8F5E9', text: '#1B5E20', border: '#A5D6A7' },
  training: { bg: '#FFF8E1', text: '#E65100', border: '#FFE082' },
  workshop: { bg: '#F3E5F5', text: '#4A148C', border: '#CE93D8' },
  conference: { bg: '#E0F7FA', text: '#006064', border: '#80DEEA' },
  default: { bg: '#ECEFF1', text: '#263238', border: '#CFD8DC' },
};
const getTypeColors = (type) => typeColorMap[type] || typeColorMap.default;

const WeeklyView = ({ selectedDate, events = [] }) => {
  const router = useRouter();

  // selectedDate hem Date hem String gelebilir, dayjs ile güvenle parse ediyoruz
  const validDate = dayjs(selectedDate).isValid() ? dayjs(selectedDate) : dayjs();

  // Haftanın pazartesi başlamasını istiyorsanız startOf('week') + add(1, 'day') yapabilirsiniz
  // (isoWeek plugin'i varsa: validDate.startOf('isoWeek') şeklinde de olur.)
  const startOfWeek = validDate.startOf('week').add(1, 'day');

  // Haftanın 7 gününü hesapla
  const weekDays = Array.from({ length: 7 }, (_, i) => startOfWeek.add(i, 'day'));

  // Etkinlik kutusuna tıklandığında yönlendirme
  const handleClick = (eventId) => {
    router.push(`/etkinlik/${eventId}`);
  };

  return (
    <Grid container sx={{ height: 'calc(100vh - 100px)' }}>
      {/* ÜSTTE GÜN BAŞLIKLARI */}
      <Grid item xs={12} container>
        {/* Sol boşluk (Saatlerin üzerinde hizalama için) */}
        <Grid item xs={1} />

        {/* Haftanın günleri */}
        {weekDays.map((day, index) => (
          <Grid
            key={day.format('YYYY-MM-DD')}
            item
            xs={11 / 7}
            sx={{
              textAlign: 'center',
              borderRight: index < 6 ? '1px solid #ddd' : 'none',
            }}
          >
            <Typography variant="h6">
              {daysOfWeek[index]} {day.format('DD')}
            </Typography>
          </Grid>
        ))}
      </Grid>

      {/* ALTTA SAATLER ve ETKİNLİK ÇİZGİLERİ */}
      <Grid item xs={12} container>
        {/* SOL SÜTUN (SAATLER) */}
        <Grid item xs={1}>
          {hours.map((hour, index) => (
            <Box
              key={`hour-${index}`}
              sx={{
                height: 30, 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                paddingRight: 1,
                borderBottom: '1px solid #ddd',
              }}
            >
              <Typography variant="body2">{hour}</Typography>
            </Box>
          ))}
        </Grid>

        {/* SAĞ SÜTUNLAR (GÜNLER) */}
        {weekDays.map((day, dayIndex) => (
          <Grid
            key={day.format('YYYY-MM-DD')}
            item
            xs={11 / 7}
            sx={{
              borderRight: dayIndex < 6 ? '1px solid #ddd' : 'none',
              position: 'relative',
            }}
          >
            {/* Arkaplanda her saat için çizgiler */}
            {hours.map((_, hourIndex) => (
              <Box
                key={`grid-${hourIndex}`}
                sx={{
                  height: 30,
                  borderBottom: '1px solid #ddd',
                }}
              />
            ))}

            {/* GÜNE AİT ETKİNLİKLERİ FİLTRELEYELİM */}
            {events
              .filter((event) => {
                // Etkinlik başlangıç/bitişini dayjs nesnesine çevir
                const eventStart = dayjs(event.startDate);
                const eventEnd = event.endDate ? dayjs(event.endDate) : eventStart; // endDate yoksa aynı an

                // Mevcut "day" (hafta içindeki gün) ile karşılaştır:
                // Yöntem A: Plugin'siz, "day" bazında karşılaştırma
                const isSameOrAfterStart = day.startOf('day').diff(eventStart.startOf('day'), 'days') >= 0;
                const isSameOrBeforeEnd = day.startOf('day').diff(eventEnd.startOf('day'), 'days') <= 0;

                // Yöntem B: Plugin ile
                // const isSameOrAfterStart = day.isSameOrAfter(eventStart, 'day');
                // const isSameOrBeforeEnd = day.isSameOrBefore(eventEnd, 'day');

                return isSameOrAfterStart && isSameOrBeforeEnd;
              })
              .map((event) => {
                // Pozisyon ve süre hesaplama
                const eventStart = dayjs(event.startDate);
                const eventEnd = event.endDate ? dayjs(event.endDate) : eventStart;

                // Bu etkinlik, hangi saate denk geliyor?
                // Eğer etkinliğin gerçekten aynı güne düştüğü kesinleştiyse:
                // O gün için "saat"i bulalım (0–23 aralığında).
                // dayjs nesnesi, "day" ile aynı günse:
                // startHour = (eventStart.hour()),  (0–23)
                const startHour = day.isSame(eventStart, 'day') ? eventStart.hour() : 0;
                
                // Süre (saat cinsinden)
                // Not: Eğer etkinlik ertesi günlere taşıyorsa, tam günü hesaplamak gerekir
                // Burada basitçe eventEnd - eventStart
                let duration = eventEnd.diff(eventStart, 'hour', true); 
                // en az 1 saat
                duration = duration < 1 ? 1 : duration; 

                // Piksel olarak 1 saat = 30px
                // height: 30 * duration
                const topPosition = startHour * 30;
                const boxHeight = 30;
                const colors = getTypeColors(event.eventType);
                const tooltip = `${event.title}${event.spot ? ' — ' + event.spot : ''}`;

                return (
                  <Tooltip key={event._id} title={tooltip} arrow>
                    <Box
                      onClick={() => handleClick(event._id)}
                      sx={{
                        position: 'absolute',
                        top: topPosition,
                        left: 8,
                        right: 8,
                        height: boxHeight,
                        bgcolor: colors.bg,
                        color: colors.text,
                        border: `1px solid ${colors.border}`,
                        padding: 1,
                        borderRadius: 1,
                        zIndex: 2,
                        fontSize: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {event.title}
                    </Box>
                  </Tooltip>
                );
              })}
          </Grid>
        ))}
      </Grid>
    </Grid>
  );
};

export default WeeklyView;
