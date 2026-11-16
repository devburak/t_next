import { Box, Button, Typography } from '@mui/material';
import FileDownloadOutlined from '@mui/icons-material/FileDownloadOutlined';
import { calendarButtonSx } from './calendarStyles';
export default function CalendarSubscription({ year = new Date().getFullYear() }) {
  const query = new URLSearchParams({ startDate: `${year}-01-01`, endDate: `${year}-12-31` });
  return (
    <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid var(--calendar-border)' }}>
      <Typography component="h3" sx={{ m: 0, mb: 1, fontSize: '16px !important', fontWeight: 700 }}>
        Takviminizde saklayın
      </Typography>
      <Typography
        component="div"
        sx={{ fontSize: 13, lineHeight: 1.6, color: 'text.secondary', mb: 2 }}
      >
        Google Takvim’e eklemek için bir etkinlik açın. Yıllık takvimi Apple ve Outlook için
        indirebilirsiniz.
      </Typography>
      <Button
        component="a"
        href={`/api/events/ics?${query}`}
        variant="outlined"
        startIcon={<FileDownloadOutlined />}
        sx={{ ...calendarButtonSx, width: '100%' }}
      >
        {year} takvimini indir (ICS)
      </Button>
    </Box>
  );
}
