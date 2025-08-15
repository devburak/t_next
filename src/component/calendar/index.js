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


const CustomCalendar = ({ value = new Date(), onChange, events: externalEvents, onMonthChange }) => {
  const [currentDate, setCurrentDate] = useState(value); // Seçili tarih
  const [events, setEvents] = useState([]); // Etkinlikler (dahili)
  const [isLoading, setIsLoading] = useState(false); // Yüklenme durumu
  const [anchorEl, setAnchorEl] = useState(null);
  const [popperEtkinlik, setPopperEtkinlik] = useState(null);
  const lastFetchedDateRef = useRef(null); // En son çekilen ay ve yıl bilgisi
  const lastActiveMonthRef = useRef({ y: null, m: null });
  const open = Boolean(anchorEl);

  const isSameDay = (a, b) => {
    if (!(a instanceof Date) || !(b instanceof Date)) return false;
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  };

 // Etkinlikleri API'den çekme
 const fetchEvents = async (startDate, endDate) => {
  // Eğer dışarıdan events veriliyorsa dahili fetch yapma
  if (externalEvents && Array.isArray(externalEvents)) {
    setEvents(externalEvents);
    return;
  }
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
  // Dışarıdan gelen events her değiştiğinde güncelle
  if (externalEvents && Array.isArray(externalEvents)) {
    setEvents(externalEvents);
  }
}, [externalEvents]);

// Ebeveyn value değiştiğinde senkronize et
useEffect(() => {
  if (value instanceof Date && !isNaN(value)) {
    // Gün bazında karşılaştırma; aynı günse state güncellemeyelim
    if (!isSameDay(currentDate, value)) {
      setCurrentDate(value);
    }
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [value]);

useEffect(() => {
  updateEventsForMonth(currentDate, lastFetchedDateRef, fetchEvents);
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Ay navigasyonu (react-calendar içi oklar veya swipe) yakalamak için
  const handleActiveStartDateChange = ({ activeStartDate, view }) => {
    if (view === 'month' && activeStartDate instanceof Date) {
      const y = activeStartDate.getFullYear();
      const m = activeStartDate.getMonth();
      const last = lastActiveMonthRef.current;
      // Sadece yıl/ay değiştiyse işlem yap
      if (last.y !== y || last.m !== m) {
        lastActiveMonthRef.current = { y, m };
        if (typeof onMonthChange === 'function') {
          onMonthChange(activeStartDate);
        }
        // Ay başlangıcını seçili tarih olarak atarken gün bazında gereksiz güncellemeyi önle
        if (!isSameDay(currentDate, activeStartDate)) {
          setCurrentDate(activeStartDate);
        }
      }
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
  // Gün içinde etkinlik var mı? Sadece noktayı göstereceğiz, sınıf döndürmeyeceğiz
  // const hasEvent = events.some(event => {
  //   const start = new Date(event.startDate);
  //   const end = event.endDate ? new Date(event.endDate) : start;
  //   const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  //   return d >= new Date(start.getFullYear(), start.getMonth(), start.getDate()) &&
  //          d <= new Date(end.getFullYear(), end.getMonth(), end.getDate());
  // });
  // if (hasEvent) return 'eventDay';
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
        const start = new Date(event.startDate);
        const end = event.endDate ? new Date(event.endDate) : start;
        const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        return d >= new Date(start.getFullYear(), start.getMonth(), start.getDate()) &&
               d <= new Date(end.getFullYear(), end.getMonth(), end.getDate());
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
        onActiveStartDateChange={handleActiveStartDateChange}
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
