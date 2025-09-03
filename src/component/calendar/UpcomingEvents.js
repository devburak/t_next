import React, { useEffect, useState } from 'react';
import { Box, List, ListItemButton, ListItemText, Typography, CircularProgress } from '@mui/material';
import dayjs from 'dayjs';

export default function UpcomingEvents({ limit = 10 }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUpcoming = async () => {
      setLoading(true);
      setError(null);
      try {
        const nowIso = dayjs().startOf('day').toISOString();
        const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/events/list?startDate=${encodeURIComponent(nowIso)}&limit=${limit}&sort=asc`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`API ${res.status}`);
        const data = await res.json();
        setItems(data.events || []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUpcoming();
  }, [limit]);

  if (loading) return <CircularProgress size={18} />;
  if (error) return <Typography color="error" variant="caption">Yüklenemedi</Typography>;
  if (!items.length) return <Typography variant="caption">Yaklaşan etkinlik yok</Typography>;

  return (
    <Box>
      <List dense>
        {items.map((ev) => {
          const d = dayjs(ev.startDate);
          const dateStr = d.format('DD MMM YYYY');
          return (
            <ListItemButton key={ev._id} component="a" href={`/etkinlik/${ev._id}`} sx={{ py: 0.5 }}>
              <ListItemText
                primaryTypographyProps={{ noWrap: true }}
                secondaryTypographyProps={{ noWrap: true }}
                primary={ev.title}
                secondary={dateStr}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );
}
