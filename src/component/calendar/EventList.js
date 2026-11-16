import { Box, ButtonBase, Stack, Typography } from '@mui/material';
import AccessTimeRounded from '@mui/icons-material/AccessTimeRounded';
import LocationOnOutlined from '@mui/icons-material/LocationOnOutlined';
import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded';
import { formatEventTime } from '../../lib/calendar.mjs';
export default function EventList({ events = [], onEventClick }) {
  return (
    <Stack spacing={1.5}>
      {events.map((event) => (
        <ButtonBase
          key={event._id}
          onClick={() => onEventClick(event)}
          sx={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 2,
            p: 2,
            textAlign: 'left',
            minHeight: 64,
            border: '1px solid var(--calendar-border)',
            borderRadius: 3,
            bgcolor: 'var(--calendar-surface)',
            '&:hover': { bgcolor: 'var(--calendar-muted)' },
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              component="div"
              sx={{ fontSize: 15, fontWeight: 650, lineHeight: 1.5, overflowWrap: 'anywhere' }}
            >
              {event.title}
            </Typography>
            <Stack
              direction="row"
              spacing={1.5}
              useFlexGap
              flexWrap="wrap"
              sx={{ mt: 1, color: 'text.secondary', fontSize: 13 }}
            >
              <Stack direction="row" spacing={0.5} alignItems="center">
                <AccessTimeRounded sx={{ fontSize: 16 }} />
                <span>{formatEventTime(event)}</span>
              </Stack>
              {event.location && (
                <Stack direction="row" spacing={0.5} alignItems="center" sx={{ minWidth: 0 }}>
                  <LocationOnOutlined sx={{ fontSize: 16, flexShrink: 0 }} />
                  <Box component="span" sx={{ overflowWrap: 'anywhere' }}>
                    {event.location}
                  </Box>
                </Stack>
              )}
            </Stack>
          </Box>
          <ArrowForwardRounded
            sx={{ mt: 0.5, flexShrink: 0, fontSize: 20, color: 'text.secondary' }}
          />
        </ButtonBase>
      ))}
    </Stack>
  );
}
