import React, { useState, useEffect } from 'react';
import CalendarView from '../../component/calendar/CalendarView'; // CalendarView bileşenini içeri aktarıyoruz
import { Box, Typography, Button } from '@mui/material';
import dayjs from 'dayjs';
import Header from '../../component/basic/header';
import Chambers from '../../component/basic/chambers';
import Footer from '../../component/basic/footer';
import dynamic from 'next/dynamic';
import CalendarSubscription from '../../component/calendar/CalendarSubscription';
import TopMenu from '../../component/basic/topMenu';
import 'react-calendar/dist/Calendar.css';

const DynamicCalendar = dynamic(() => import('../../component/calendar'), { ssr: false });

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

const CalendarPage = ({ initialEvents, initialView, initialSelectedDate }) => {
  const [view, setView] = useState(initialView);
  const [currentDate, setCurrentDate] = useState(dayjs(initialSelectedDate));
  const [events, setEvents] = useState(initialEvents);

  const fetchEvents = async (startDate, endDate) => {
    try {
      const res = await fetch(`${apiBaseUrl}/events/list?startDate=${startDate}&endDate=${endDate}`);
      if (!res.ok) {
        console.error('API İsteği Başarısız:', res.status, res.statusText);
        return;
      }
      const data = await res.json();
      setEvents(data.events);
    } catch (error) {
      console.error('Veri çekme hatası:', error);
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
      endDate = currentDate.format('YYYY-MM-DD');
    }

    fetchEvents(startDate, endDate);
  };

  useEffect(() => {
    updateDateRangeAndFetchEvents();
  }, [currentDate, view]);

  const handleToday = () => {
    setCurrentDate(dayjs());
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
    <div>
      <Header />
      <TopMenu />
      <Box className="site-shell site-shell--content">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: { xs: 'auto', md: 'calc(100vh - 220px)' },
            overflow: 'hidden',
            border: '1px solid #d6dde7',
            borderRadius: '20px',
            bgcolor: '#fff',
            boxShadow: '0 18px 42px rgba(15, 23, 42, 0.08)',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: { xs: 'stretch', sm: 'center' },
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2,
              p: { xs: 2, md: 3 },
              borderBottom: '1px solid #ddd',
              bgcolor: 'white',
              zIndex: 2,
            }}
          >
            <Button variant="outlined" onClick={handleToday}>
              Bugün
            </Button>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'space-between', sm: 'center' }, gap: 2 }}>
              <Button onClick={() => handleNavigate(-1)}>{'<'}</Button>
              <Typography variant="h5">{currentDate.format('MMMM YYYY')}</Typography>
              <Button onClick={() => handleNavigate(1)}>{'>'}</Button>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden', flexDirection: { xs: 'column', md: 'row' } }}>
            <Box
              sx={{
                width: { xs: '100%', md: '320px' },
                flexShrink: 0,
                p: { xs: 2, md: 3 },
                borderRight: { md: '1px solid #ddd' },
                borderBottom: { xs: '1px solid #ddd', md: 0 },
                overflowY: 'auto',
              }}
            >
              <DynamicCalendar
                events={events}
                value={currentDate.toDate()}
                onChange={(date) => setCurrentDate(dayjs(date))}
                onMonthChange={(activeStartDate) => setCurrentDate(dayjs(activeStartDate))}
              />
              <CalendarSubscription />
            </Box>

            <Box sx={{ flex: 1, overflow: 'auto', minWidth: 0 }}>
              <CalendarView
                events={events}
                initialView={view}
                selectedDate={currentDate}
                setView={setView}
                onDateChange={setCurrentDate}
              />
            </Box>
          </Box>
        </Box>
      </Box>
      <Chambers />
      <Footer />
    </div>
  );
};

export async function getServerSideProps({ params }) {
  const { params: urlParams = [] } = params;
  let startDate, endDate, initialView;
  const currentDate = dayjs();
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

  try {
    const res = await fetch(`${apiBaseUrl}/events/list?startDate=${startDate}&endDate=${endDate}`);
    if (!res.ok) {
      console.error('API İsteği Başarısız:', res.status, res.statusText);
      return { notFound: true };
    }
    const data = await res.json();
    return {
      props: {
        initialEvents: data.events,
        initialView,
        initialSelectedDate: dayjs(startDate).toISOString(),
      },
    };
  } catch (error) {
    console.error('Veri çekme hatası:', error);
    return { notFound: true };
  }
}

export default CalendarPage;
