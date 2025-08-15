import { Button, Typography } from '@mui/material';

export default function CalendarSubscription() {
  // Mevcut yılı al
  const currentYear = new Date().getFullYear();

  // Dinamik başlangıç ve bitiş tarihleri
  const startDate = `${currentYear}-01-01`;
  const endDate = `${currentYear}-12-31`;

  return (
    <div style={{ marginTop: '2rem' }}>
      <Typography variant="subtitle1" gutterBottom>Takvim Abonelik</Typography>
      <hr />
      <Button
        component="a"
        href={`/api/events/ics?startDate=${startDate}&endDate=${endDate}`}
        target="_blank"
        variant="outlined"
        size="small"
        download
      >
        {currentYear} yılı etkinliklerini indir (ICS)
      </Button>
    </div>
  );
}
  