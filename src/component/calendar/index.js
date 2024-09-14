import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // Default stil dosyasını içe aktar
import { Popper, Box, Typography } from '@mui/material';


const fakeEtkinlikler = [
    {
        baslik: 'Etkinlik 1',
        date: new Date('2024-02-23T02:56:38.338+00:00'),
        time: "14:30",
        yer: 'Ankara',
        link: 'https://www.etkinlik1.com',
    },
    {
        baslik: 'Etkinlik 2',
        date: new Date('2024-02-03T02:56:38.338+00:00'),
        time: "16:30",
        yer: 'İstanbul',
        link: 'https://www.etkinlik2.com',
    },
    // Diğer fake etkinlikler buraya eklenebilir...
];

function CustomCalendar() {
    const [anchorEl, setAnchorEl] = useState(null);
    const [popperEtkinlik, setPopperEtkinlik] = useState(null);
    const open = Boolean(anchorEl);

    const etkinlikTarihleri = fakeEtkinlikler.map(etkinlik => etkinlik.date);

    const tileClassName = ({ date, view }) => {
        const today = new Date();
        // Check if we are in the month view
        if (view === 'month') {
          // Special style for today's date
          if (
            date.getFullYear() === today.getFullYear() &&
            date.getMonth() === today.getMonth() &&
            date.getDate() === today.getDate()
          ) {
            return 'todayStyle';
          }
      
          // Special style for event days
          const hasEvent = etkinlikTarihleri.some(
            eventDate =>
              date.getFullYear() === eventDate.getFullYear() &&
              date.getMonth() === eventDate.getMonth() &&
              date.getDate() === eventDate.getDate()
          );
      
          if (hasEvent) {
            return 'eventDay'; // This class should be predefined and styled
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
            const etkinlik = fakeEtkinlikler.find(etkinlik =>
                date.getFullYear() === etkinlik.date.getFullYear() &&
                date.getMonth() === etkinlik.date.getMonth() &&
                date.getDate() === etkinlik.date.getDate()
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
                tileClassName={tileClassName}
                tileContent={tileContent}
            />
            <Popper open={open} anchorEl={anchorEl} placement="top">
                <Box sx={{ border: 1, p: 1, bgcolor: 'background.paper' }}>
                    {popperEtkinlik && (
                        <>
                            <Typography>{popperEtkinlik.baslik}</Typography>
                            <Typography>{popperEtkinlik.yer}</Typography>
                            <Typography>{popperEtkinlik.time}</Typography>
                        </>
                    )}
                </Box>
            </Popper>
        </>
    );
}

export default CustomCalendar;
