import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import CloseRounded from '@mui/icons-material/CloseRounded';
import EventSummary from './EventSummary';
import { calendarDay } from '../../lib/calendar.mjs';
import { calendarUiSx } from './calendarStyles';

export default function EventDialog({ events = [], date, onClose }) {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('sm'));
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const title =
    events.length === 1
      ? events[0].title
      : date
        ? calendarDay(date).format('D MMMM YYYY, dddd')
        : 'Etkinlikler';
  return (
    <Dialog
      open={events.length > 0}
      onClose={onClose}
      fullScreen={mobile}
      fullWidth
      maxWidth="sm"
      aria-labelledby="calendar-event-dialog-title"
      transitionDuration={reduceMotion ? 0 : undefined}
      PaperProps={{
        sx: { ...calendarUiSx, borderRadius: mobile ? 0 : 4, backgroundImage: 'none' },
      }}
    >
      <DialogTitle component="div" sx={{ p: 3, pt: 'max(24px, env(safe-area-inset-top))', borderBottom: '1px solid var(--calendar-border)' }}>
        <Stack direction="row" spacing={2} alignItems="flex-start" justifyContent="space-between">
          <Box sx={{ minWidth: 0 }}>
            <Typography
              component="div"
              variant="overline"
              sx={{ color: 'var(--calendar-accent)', letterSpacing: '0.08em' }}
            >
              ETKİNLİKLER{events.length > 1 ? ` · ${events.length}` : ''}
            </Typography>
            <Typography
              id="calendar-event-dialog-title"
              component="h2"
              sx={{
                m: 0,
                fontSize: '22px !important',
                fontWeight: 700,
                lineHeight: 1.4,
                overflowWrap: 'anywhere',
              }}
            >
              {title}
            </Typography>
          </Box>
          <IconButton
            aria-label="Etkinlik penceresini kapat"
            onClick={onClose}
            sx={{ width: 44, height: 44, flexShrink: 0 }}
          >
            <CloseRounded />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ p: 3, pb: 'max(24px, env(safe-area-inset-bottom))' }}>
        <Stack spacing={3} divider={<Divider />} sx={{ pt: 1 }}>
          {events.map((event) => (
            <EventSummary key={event._id} event={event} showTitle={events.length > 1} />
          ))}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
