// components/CustomCalendar.js
import React, { useState } from 'react';
import Calendar from 'react-calendar';
import { Popper, Box, Typography } from '@mui/material';
import 'react-calendar/dist/Calendar.css'; // Default stil dosyasını içe aktar

const CustomCalendar = ({ value = new Date(), onChange, events = [] }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [popperEtkinlik, setPopperEtkinlik] = useState(null);
  const open = Boolean(anchorEl);

  // Etkinlik tarihlerini kontrol ederken güvenli kontrol ekleyin
  const etkinlikTarihleri = events
    .map(event => new Date(event.startDate)) // startDate'i Date nesnesine dönüştür
    .filter(date => date instanceof Date && !isNaN(date)); // Geçerli Date nesnelerini filtreleyin

  const tileClassName = ({ date, view }) => {
    const today = new Date();
    if (view === 'month') {
      // Bugünün tarihini özel stil ile göster
      if (
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()
      ) {
        return 'todayStyle';
      }

      // Etkinlik günlerini özel stil ile göster
      const hasEvent = etkinlikTarihleri.some(eventDate => {
        return (
          eventDate instanceof Date && // eventDate'in geçerli bir Date olduğundan emin olun
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
      const etkinlik = events.find(event =>
        event.startDate && // startDate kontrolü ekleyin
        new Date(event.startDate) instanceof Date && // event.startDate'in geçerli bir Date olduğundan emin olun
        date.getFullYear() === new Date(event.startDate).getFullYear() &&
        date.getMonth() === new Date(event.startDate).getMonth() &&
        date.getDate() === new Date(event.startDate).getDate()
      );

      if (etkinlik) {
        return (
          <div
            onMouseEnter={(e) => handleMouseEnter(e, etkinlik)}
            onMouseLeave={handleMouseLeave}
          >
            <span style={{ color: 'white' }}>•</span>
          </div>
        );
      }
    }
  };

  return (
    <>
      <Calendar
        className="customCalendar"
        value={value} // Seçili tarih
        onChange={onChange} // Tarih değişikliklerini yönetir
        tileClassName={tileClassName}
        tileContent={tileContent}
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

// Varsayılan props değerleri
CustomCalendar.defaultProps = {
  value: new Date(), // Varsayılan olarak bugünün tarihi
  onChange: () => {}, // Boş fonksiyon (kullanıcıdan beklenen)
  events: [], // Varsayılan olarak boş etkinlik listesi
};

export default CustomCalendar;
