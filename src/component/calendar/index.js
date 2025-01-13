import React, { useState, useEffect, useRef } from 'react';
import Calendar from 'react-calendar';
import { Popper, Box, Typography, CircularProgress } from '@mui/material';
import 'react-calendar/dist/Calendar.css';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

// Tarih aralığını günceller ve etkinlikleri çeker
const updateEventsForMonth = (date, lastFetchedDateRef, fetchEvents) => {
  // Eğer geçerli bir Date nesnesi değilse bugünün tarihini kullan
  const validDate = date instanceof Date ? date : new Date();

  const currentMonth = validDate.getMonth();
  const currentYear = validDate.getFullYear();

  // Eğer ay ve yıl değişmediyse, tekrar fetch yapılmaz
  if (
    lastFetchedDateRef.current &&
    lastFetchedDateRef.current.month === currentMonth &&
    lastFetchedDateRef.current.year === currentYear
  ) {
    return;
  }

  // Ay ve yıl değişmişse API'den veri çek
  const startDate = new Date(currentYear, currentMonth, 1).toISOString();
  const endDate = new Date(currentYear, currentMonth + 1, 0).toISOString();

  fetchEvents(startDate, endDate);

  // Yeni tarih aralığını sakla
  lastFetchedDateRef.current = { month: currentMonth, year: currentYear };
};


const CustomCalendar = ({ value = new Date(), onChange }) => {
  const [currentDate, setCurrentDate] = useState(value); // Seçili tarih
  const [events, setEvents] = useState([]); // Etkinlikler
  const [isLoading, setIsLoading] = useState(false); // Yüklenme durumu
  const [anchorEl, setAnchorEl] = useState(null);
  const [popperEtkinlik, setPopperEtkinlik] = useState(null);
  const lastFetchedDateRef = useRef(null); // En son çekilen ay ve yıl bilgisi
  const open = Boolean(anchorEl);

 // Etkinlikleri API'den çekme
 const fetchEvents = async (startDate, endDate) => {
  setIsLoading(true);
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/events/list?startDate=${startDate}&endDate=${endDate}`);
    if (!res.ok) {
      console.error('API İsteği Başarısız:', res.status, res.statusText);
      setIsLoading(false);
      return;
    }
    const data = await res.json();
    setEvents(data.events || []); // Gelen etkinlikleri güncelle
  } catch (error) {
    console.error('Etkinlikleri çekerken hata:', error);
  } finally {
    setIsLoading(false); // Her durumda yükleme durumu kapatılır
  }
};

// İlk render ve tarih değişiminde etkinlikleri kontrol et
useEffect(() => {
  updateEventsForMonth(currentDate, lastFetchedDateRef, fetchEvents);
}, [currentDate]);

// const updateEventsForMonth = (date) => {
//   // Eğer geçerli bir Date nesnesi değilse bugünün tarihini kullan
//   const validDate = date instanceof Date ? date : new Date();

//   const startDate = new Date(validDate.getFullYear(), validDate.getMonth(), 1).toISOString();
//   const endDate = new Date(validDate.getFullYear(), validDate.getMonth() + 1, 0).toISOString();

//   fetchEvents(startDate, endDate);
// };



  const handleDateChange = (date) => {
    if (date instanceof Date) {
      setCurrentDate(date);
      if (onChange) {
        onChange(date); // Tarih değişikliğini dışarıya bildirme
      }
    } else {
      console.error('Geçersiz tarih:', date);
    }
  };

  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const today = new Date();
      // Bugünü özel stil ile göster
      if (
        date instanceof Date &&
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()
      ) {
        return 'todayStyle';
      }

      // Etkinlik günlerini özel stil ile göster
      const hasEvent = events.some(event => {
        const eventDate = new Date(event.startDate);
        return (
          eventDate instanceof Date &&
          date.getFullYear() === eventDate.getFullYear() &&
          date.getMonth() === eventDate.getMonth() &&
          date.getDate() === eventDate.getDate()
        );
      });

      if (hasEvent) {
        return 'eventDay';
      }
    }
  };

  const handleMouseEnter = (event, etkinlik) => {
    setAnchorEl(event.currentTarget);
    setPopperEtkinlik(etkinlik);
  };

  const handleMouseLeave = () => {
    setAnchorEl(null);
    setPopperEtkinlik(null);
  };

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      // Seçili tarih için etkinlikleri kontrol et
      const etkinlik = events.find(event => {
        if (!event.startDate) return false; // startDate yoksa kontrolü atla
        const eventDate = new Date(event.startDate); // startDate'i Date nesnesine dönüştür
        return (
          eventDate instanceof Date && // eventDate'in geçerli bir Date olduğundan emin olun
          date.getFullYear() === eventDate.getFullYear() &&
          date.getMonth() === eventDate.getMonth() &&
          date.getDate() === eventDate.getDate()
        );
      });

      if (etkinlik) {
        return (
          <div
            onMouseEnter={(e) => handleMouseEnter(e, etkinlik)}
            onMouseLeave={handleMouseLeave}
          >
            <span style={{ color: 'purple', fontSize: '16px', fontWeight: 'bold' }}>•</span>
          </div>
        );
      }
    }
    return null; // Eğer etkinlik yoksa içerik gösterme
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  return (
    <>
      <Calendar
        className="customCalendar"
        value={currentDate} // Seçili tarih
        onChange={handleDateChange} // Tarih değişikliklerini yönetir
        tileClassName={tileClassName}
        tileContent={tileContent}
        locale='tr-TR'
      />
      <Popper open={open} anchorEl={anchorEl} placement="top">
        <Box sx={{ border: 1, p: 1, bgcolor: 'background.paper' }}>
          {popperEtkinlik && (
            <>
              <Typography>{popperEtkinlik.title}</Typography>
              <Typography>{popperEtkinlik.location}</Typography>
              <Typography>{new Date(popperEtkinlik.startDate).toLocaleTimeString()}</Typography>
            </>
          )}
        </Box>
      </Popper>
    </>
  );
};

export default CustomCalendar;
