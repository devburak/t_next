// components/CalendarView.js
import React, { useEffect } from 'react';
import { Box, Button, Typography } from '@mui/material';
import dayjs from 'dayjs'; // Tarih yönetimi için dayjs kütüphanesi
import 'dayjs/locale/tr'; // Türkçe dil desteği
import DailyView from './DailyView';
import WeeklyView from './WeeklyView';
import MonthlyView from './MonthlyView';

dayjs.locale('tr'); // Türkçe dil ayarı

const CalendarView = ({ events, initialView, selectedDate, setView, onDateChange }) => {
  const [internalView, setInternalView] = React.useState(initialView || 'monthly'); // Varsayılan görünüm

  // Eğer dışarıdan bir setView fonksiyonu gelirse onu kullan, yoksa kendi iç fonksiyonumuzu kullan
  const handleViewChange = (newView) => {
    if (setView) {
      setView(newView);
    } else {
      setInternalView(newView);
    }
  };

  const handleTodayClick = () => {
    onDateChange(dayjs());
  };

  useEffect(() => {
    // Eğer view prop'u değişirse, bunu bileşen içi duruma yansıt
    setInternalView(initialView);
  }, [initialView]);

  const currentView = setView ? initialView : internalView; // Güncel görünümü belirle

  return (
    <Box>
      {/* Görünüm değiştirici düğmeler */}
      <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: 2, gap: 2 }}>
        <Button variant={selectedDate.isSame(dayjs(), 'day') ? 'contained' : 'outlined'} onClick={handleTodayClick}>
          Bugün
        </Button>
        <Button variant={currentView === 'daily' ? 'contained' : 'outlined'} onClick={() => handleViewChange('daily')}>
          Günlük Görünüm
        </Button>
        <Button variant={currentView === 'weekly' ? 'contained' : 'outlined'} onClick={() => handleViewChange('weekly')}>
          Haftalık Görünüm
        </Button>
        <Button variant={currentView === 'monthly' ? 'contained' : 'outlined'} onClick={() => handleViewChange('monthly')}>
          Aylık Görünüm
        </Button>
      </Box>

      {/* Seçili görünüme göre bileşen gösterimi */}
      {currentView === 'daily' && (
        <DailyView
          events={events}
          selectedDate={selectedDate.toDate()} // Date nesnesi olarak geç
        />
      )}
      {currentView === 'weekly' && (
        <WeeklyView
          events={events}
          selectedDate={selectedDate.toDate()} // Date nesnesi olarak geç
          setSelectedDate={onDateChange}
        />
      )}
      {currentView === 'monthly' && (
        <MonthlyView
          events={events}
          selectedDate={selectedDate.toDate()} // Date nesnesi olarak geç
          setSelectedDate={onDateChange}
        />
      )}
    </Box>
  );
};

// Varsayılan props değerleri
CalendarView.defaultProps = {
  initialView: 'monthly',
  onDateChange: () => {}, // Tarih değişim fonksiyonu yoksa iç durumu kullan
};

export default CalendarView;
