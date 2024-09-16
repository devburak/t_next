// pages/takvim/[...params].js
import React, { useState, useEffect } from 'react';
import CalendarView from '../../component/calendar/CalendarView'; // CalendarView bileşenini içeri aktarıyoruz
import { Box, Typography, Button } from '@mui/material';
import dayjs from 'dayjs';
import dynamic from 'next/dynamic';
import 'react-calendar/dist/Calendar.css';

// Custom takvim bileşenini dinamik olarak yükler
const DynamicCalendar = dynamic(
  () => import('../../component/calendar'), // Takvim bileşeninin yolu
  { ssr: false } // Server-side rendering'i devre dışı bırak
);

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

const CalendarPage = ({ initialEvents, initialView, initialSelectedDate }) => {
  const [view, setView] = useState(initialView); // Görünüm durumu
  const [currentDate, setCurrentDate] = useState(dayjs(initialSelectedDate)); // Tarih durumu
  const [events, setEvents] = useState(initialEvents); // Etkinlik verisi

  const fetchEvents = async (startDate, endDate) => {
    try {
      const res = await fetch(`${apiBaseUrl}/events/list?startDate=${startDate}&endDate=${endDate}`);
      if (!res.ok) {
        console.error('API İsteği Başarısız:', res.status, res.statusText);
        return;
      }
      const data = await res.json();
      console.log(data)
      setEvents(data.events);
    } catch (error) {
      console.error("Veri çekme hatası:", error);
    }
  };

  const updateDateRangeAndFetchEvents = () => {
    let startDate, endDate;

      if (view === 'monthly') {
          startDate = currentDate.startOf('year').format('YYYY-MM-DD');
          endDate = currentDate.endOf('year').format('YYYY-MM-DD');
      } else if (view === 'weekly') {
          startDate = currentDate.startOf('week').format('YYYY-MM-DD');
          endDate = currentDate.endOf('week').format('YYYY-MM-DD');
      } else if (view === 'daily') {
          startDate = currentDate.format('YYYY-MM-DD');
          //  endDate = currentDate.format('YYYY-MM-DD');
          endDate = null
      }

    fetchEvents(startDate, endDate);
  };

  useEffect(() => {
    updateDateRangeAndFetchEvents();
  }, [currentDate, view]);

  const handleToday = () => {
    setCurrentDate(dayjs()); // Bugüne git
  };

  const handleDateChange = (date) => {
    setCurrentDate(dayjs(date)); // Tarih seçiciden tarih değiştiğinde tarih ayarla
  };

  const handleNavigate = (direction) => {
    if (view === 'monthly') {
      setCurrentDate(currentDate.add(direction, 'month'));
    } else if (view === 'weekly') {
      setCurrentDate(currentDate.add(direction, 'week'));
    } else {
      setCurrentDate(currentDate.add(direction, 'day'));
    }
  };


  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Sol taraf - Tarih Seçici */}
      <Box sx={{ width: '20%', padding: 2, borderRight: '1px solid #ddd' }}>
        <DynamicCalendar
          events={events}
          value={currentDate}
          onChange={handleDateChange}
        />
      </Box>

      {/* Sağ taraf - Takvim ve Navigasyon */}
      <Box sx={{ width: '80%', padding: 2 }}>
        {/* Üst Navigasyon */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
          <Button variant="outlined" onClick={handleToday}>
            Bugün
          </Button>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button onClick={() => handleNavigate(-1)}>{'<'}</Button>
            <Typography variant="h5">
              {currentDate.format('MMMM YYYY')}
            </Typography>
            <Button onClick={() => handleNavigate(1)}>{'>'}</Button>
          </Box>
        </Box>

        <CalendarView
          events={events}
          initialView={view}
          selectedDate={currentDate}
          setView={setView}
          onDateChange={setCurrentDate}
        />
      </Box>
    </Box>
  );
};

export async function getServerSideProps({ params }) {
  const { params: urlParams = [] } = params;
  let startDate, endDate, initialView;
  const currentDate = dayjs(); // Şu anki tarih
  const selectedYear = urlParams[0] ? parseInt(urlParams[0]) : currentDate.year();
  const selectedMonth = urlParams[1] ? parseInt(urlParams[1]) - 1 : currentDate.month();
  const selectedDay = urlParams[2] ? parseInt(urlParams[2]) : currentDate.date();

  if (urlParams.length === 0) {
    initialView = 'monthly';
    startDate = currentDate.startOf('month').format('YYYY-MM-DD');
    endDate = currentDate.endOf('month').format('YYYY-MM-DD');
  } else if (urlParams.length === 1) {
    initialView = 'monthly';
    startDate = dayjs(`${selectedYear}-01-01`).format('YYYY-MM-DD');
    endDate = dayjs(`${selectedYear}-12-31`).format('YYYY-MM-DD');
  } else if (urlParams.length === 2) {
    initialView = 'monthly';
    startDate = dayjs(`${selectedYear}-${selectedMonth + 1}-01`).startOf('month').format('YYYY-MM-DD');
    endDate = dayjs(`${selectedYear}-${selectedMonth + 1}-01`).endOf('month').format('YYYY-MM-DD');
  } else if (urlParams.length === 3) {
    initialView = 'daily';
    startDate = dayjs(`${selectedYear}-${selectedMonth + 1}-${selectedDay}`).format('YYYY-MM-DD');
    endDate = startDate;
  }

  console.log('API İsteği URL:', `${apiBaseUrl}/events/list?startDate=${startDate}&endDate=${endDate}`);

  try {
    const res = await fetch(`${apiBaseUrl}/events/list?startDate=${startDate}&endDate=${endDate}`);
    if (!res.ok) {
      console.error('API İsteği Başarısız:', res.status, res.statusText);
      return { notFound: true };
    }
    const data = await res.json();
    console.log(data);
    return {
      props: {
        initialEvents: data.events,
        initialView,
        initialSelectedDate: dayjs(startDate).toISOString(),
      },
    };
  } catch (error) {
    console.error("Veri çekme hatası:", error);
    return { notFound: true };
  }
}

export default CalendarPage;
