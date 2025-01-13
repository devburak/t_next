import React from 'react';
import { Grid, Box, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';
// 1) Eklentileri import ediyoruz
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isBetween from 'dayjs/plugin/isBetween';

// 2) dayjs'e 'extend' ederek eklentileri aktif hale getiriyoruz
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(isBetween);

const daysOfWeek = ['PZT', 'SAL', 'ÇAR', 'PER', 'CUM', 'CMT', 'PAZ'];

const MonthlyView = ({ selectedDate, events = [] }) => {
  const router = useRouter();

  // selectedDate Date veya String gelebilir; dayjs ile kontrol ediyoruz
  const validDate = dayjs(selectedDate).isValid()
    ? dayjs(selectedDate)
    : dayjs();

  // Ayın başlangıcı, sonu, haftanın başlangıcı vb. hesaplar
  const startOfMonth = validDate.startOf('month');
  const endOfMonth = validDate.endOf('month');

  // Haftanın pazartesi başlaması için dayjs'in pazar-bazlı `startOf('week')` sonrasına 1 gün ekliyoruz
  // (isoWeek'i kullanıyorsanız: .startOf('isoWeek') şeklinde yapılabilir.)
  const startOfWeek = startOfMonth.startOf('week').add(1, 'day');
  const totalDays = endOfMonth.diff(startOfWeek, 'day') + 1;

  // Takvimde görüntülenecek günleri (dayjs nesneleri şeklinde) array olarak hazırlıyoruz
  const daysArray = Array.from({ length: totalDays }, (_, i) =>
    startOfWeek.add(i, 'day')
  );

  // Etkinlik detayına yönlendirme
  const handleClick = (eventId) => {
    router.push(`/etkinlik/${eventId}`);
  };

  // Gün içindeki etkinlikleri filtrele - Day.js ile gün bazında kontrol
  const getEventsForDay = (day) => {
    return events.filter((event) => {
      // Etkinliklerin başlangıç ve bitiş tarihini dayjs nesnesi olarak al
      const eventStart = dayjs(event.startDate);
      const eventEnd = event.endDate
        ? dayjs(event.endDate)
        : eventStart.endOf('day'); 
        // endDate yoksa, etkinlik aynı gün 23:59:59'a kadar sürecek demektir

      // "day" gününün, etkinlik aralığına (eventStart ~ eventEnd) saat dikkate almadan düştüğünü kontrol et
      // 'day' parametresiyle sadece "yıl-ay-gün" bazında karşılaştırma yapıyoruz (saat farkı yok sayılır)
      return (
        day.isSameOrAfter(eventStart, 'day') &&
        day.isSameOrBefore(eventEnd, 'day')
      );
    });
  };

  return (
    <Grid container spacing={1}>
      {/* Günler - Üstte (PZT, SAL, ÇAR...) */}
      {daysOfWeek.map((day) => (
        <Grid item xs={12 / 7} key={day}>
          <Typography variant="h6" sx={{ textAlign: 'center' }}>
            {day}
          </Typography>
        </Grid>
      ))}

      {/* Günlük Etkinlikler - Izgara Yapısı */}
      {daysArray.map((dayObj) => (
        <Grid
          item
          xs={12 / 7}
          key={dayObj.format('YYYY-MM-DD')}
          sx={{ border: '1px solid #ddd', minHeight: 100 }}
        >
          {/* Tarih Gösterimi */}
          <Typography variant="subtitle2" sx={{ textAlign: 'center', padding: 1 }}>
            {dayObj.date()}
          </Typography>

          {/* Günlük etkinlikleri listele */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {getEventsForDay(dayObj).map((event) => (
              <Box
                key={event._id}
                onClick={() => handleClick(event._id)}
                sx={{
                  bgcolor: 'purple',
                  color: 'white',
                  padding: 0.5,
                  borderRadius: 1,
                  textAlign: 'center',
                  cursor: 'pointer', 
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontSize: 12,
                }}
              >
                {/* Çok uzun başlıkları kısaltarak gösterelim */}
                {event.title.length > 20 ? `${event.title.slice(0, 20)}...` : event.title}
              </Box>
            ))}
          </Box>
        </Grid>
      ))}
    </Grid>
  );
};

export default MonthlyView;
