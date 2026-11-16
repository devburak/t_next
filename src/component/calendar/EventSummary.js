import { Box, Button, Chip, Stack, Typography } from '@mui/material';
import EventOutlined from '@mui/icons-material/EventOutlined';
import AccessTimeRounded from '@mui/icons-material/AccessTimeRounded';
import LocationOnOutlined from '@mui/icons-material/LocationOnOutlined';
import Google from '@mui/icons-material/Google';
import FileDownloadOutlined from '@mui/icons-material/FileDownloadOutlined';
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded';
import Link from 'next/link';
import {
  eventHref,
  eventRange,
  eventTypeLabel,
  formatEventDate,
  formatEventTime,
  googleCalendarUrl,
} from '../../lib/calendar.mjs';
import { getSiteUrl } from '../../lib/seo';
import { calendarButtonSx, calendarUiSx } from './calendarStyles';

function InfoRow({ icon: Icon, label, children }) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="flex-start">
      <Icon
        sx={{ fontSize: 22, mt: 0.25, color: 'text.secondary', flexShrink: 0 }}
        aria-hidden="true"
      />
      <Box sx={{ minWidth: 0 }}>
        <Typography component="div" variant="caption" color="text.secondary">
          {label}
        </Typography>
        <Typography
          component="div"
          sx={{ fontSize: 15, lineHeight: 1.6, overflowWrap: 'anywhere' }}
        >
          {children}
        </Typography>
      </Box>
    </Stack>
  );
}
export default function EventSummary({ event, showTitle = true, showDetailLink = true }) {
  const googleUrl = googleCalendarUrl(event, getSiteUrl());
  const actionCount = 1 + Number(showDetailLink) + Number(Boolean(googleUrl));
  const actionSx = {
    ...calendarButtonSx,
    minWidth: 0,
    px: 1,
    py: 1,
    flexDirection: { xs: 'column', sm: 'row' },
    gap: 0.5,
    fontSize: { xs: 12, sm: 13 },
    lineHeight: 1.4,
    whiteSpace: 'normal',
    '& .MuiButton-startIcon': { m: 0, flexShrink: 0 },
  };
  return (
    <Box sx={{ ...calendarUiSx, minWidth: 0 }}>
      <Stack spacing={2}>
        <Chip
          label={eventTypeLabel(event)}
          size="small"
          sx={{ alignSelf: 'flex-start', bgcolor: 'var(--calendar-muted)' }}
        />
        {showTitle && (
          <Typography
            component="h3"
            sx={{
              fontSize: '20px !important',
              m: 0,
              fontWeight: 700,
              lineHeight: 1.4,
              overflowWrap: 'anywhere',
            }}
          >
            {event.title}
          </Typography>
        )}
        <InfoRow icon={EventOutlined} label="Tarih">
          {formatEventDate(event)}
        </InfoRow>
        <InfoRow icon={AccessTimeRounded} label="Saat · Türkiye">
          {formatEventTime(event)}
        </InfoRow>
        <InfoRow icon={LocationOnOutlined} label="Konum">
          {event.location || 'Konum belirtilmemiş'}
        </InfoRow>
        {event.spot && (
          <Typography
            component="div"
            sx={{
              fontSize: 15,
              lineHeight: 1.7,
              color: 'text.secondary',
              whiteSpace: 'pre-line',
              overflowWrap: 'anywhere',
            }}
          >
            {event.spot}
          </Typography>
        )}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: `repeat(${actionCount}, minmax(0, 1fr))`,
            gap: 1,
          }}
        >
          {showDetailLink && (
            <Button
              component={Link}
              href={eventHref(event)}
              startIcon={<ArrowForwardRounded />}
              variant="contained"
              sx={{ ...actionSx, bgcolor: 'var(--calendar-ink)' }}
            >
              Etkinlik detayı
            </Button>
          )}
          {googleUrl && (
            <Button
              component="a"
              href={googleUrl}
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<Google />}
              variant="outlined"
              sx={actionSx}
            >
              Google Takvim’e ekle
            </Button>
          )}
          <Button
            component="a"
            href={`/api/events/${encodeURIComponent(event._id)}/ics`}
            startIcon={<FileDownloadOutlined />}
            variant="outlined"
            sx={actionSx}
          >
            Apple / Outlook (ICS)
          </Button>
        </Box>
        {!eventRange(event)?.hasEnd && (
          <Typography component="div" variant="caption" color="text.secondary">
            Bitiş saati belirtilmemiş. Takvime eklerken 1 saatlik bir aralık açılır; kaydetmeden
            önce değiştirebilirsiniz.
          </Typography>
        )}
      </Stack>
    </Box>
  );
}
