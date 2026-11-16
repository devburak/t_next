import { Box, ButtonBase, Typography, Tooltip, useMediaQuery, useTheme } from '@mui/material';
import { calendarDay, calendarToday, eventsOnDay } from '../../lib/calendar.mjs';
import EventList from './EventList';

export default function MonthlyView({ selectedDate, events = [], onEventClick, onDayClick }) {
  const month = calendarDay(selectedDate).startOf('month');
  const start = month.subtract((month.day() + 6) % 7, 'day');
  const theme = useTheme(),
    compact = useMediaQuery(theme.breakpoints.down('sm'));
  const selectedEvents = eventsOnDay(events, selectedDate);
  return (
    <Box>
      <Box
        role="group"
        aria-label={`${month.format('MMMM YYYY')} takvimi`}
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7,minmax(0,1fr))',
          borderTop: '1px solid var(--calendar-border)',
          borderLeft: '1px solid var(--calendar-border)',
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((day) => (
          <Typography
            key={day}
            component="div"
            sx={{
              py: 1.5,
              textAlign: 'center',
              fontSize: 12,
              fontWeight: 700,
              bgcolor: 'var(--calendar-muted)',
              borderBottom: '1px solid var(--calendar-border)',
            }}
          >
            {day}
          </Typography>
        ))}
        {Array.from({ length: 42 }, (_, i) => start.add(i, 'day')).map((day) => {
          const matches = eventsOnDay(events, day),
            current = day.isSame(calendarToday(), 'day');
          return (
            <Box
              key={day.format('YYYY-MM-DD')}
              sx={{
                minWidth: 0,
                minHeight: { xs: 72, sm: 148 },
                p: { xs: 0, sm: 0.5 },
                borderRight: '1px solid var(--calendar-border)',
                borderBottom: '1px solid var(--calendar-border)',
                bgcolor: day.isSame(month, 'month')
                  ? 'var(--calendar-surface)'
                  : 'var(--calendar-muted)',
              }}
            >
              <ButtonBase
                aria-label={`${day.format('D MMMM YYYY, dddd')}, ${matches.length} etkinlik`}
                onClick={() => onDayClick(day)}
                aria-current={current ? 'date' : undefined}
                sx={{
                  width: '100%',
                  minHeight: 44,
                  borderRadius: 2,
                  fontSize: 14,
                  fontWeight: 700,
                  color: current
                    ? 'var(--calendar-accent)'
                    : day.isSame(month, 'month')
                      ? 'var(--calendar-ink)'
                      : 'text.disabled',
                  bgcolor: day.isSame(selectedDate, 'day') ? 'action.selected' : 'transparent',
                }}
              >
                {day.date()}
              </ButtonBase>
              {compact ? (
                <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', height: 8 }}>
                  {matches.slice(0, 3).map((event) => (
                    <Box
                      key={event._id}
                      sx={{
                        width: 4,
                        height: 4,
                        borderRadius: '50%',
                        bgcolor: 'var(--calendar-accent)',
                      }}
                    />
                  ))}
                </Box>
              ) : (
                <>
                  {matches.slice(0, 2).map((event) => (
                    <Tooltip
                      key={event._id}
                      title={event.title}
                      arrow
                      placement="top"
                      disableTouchListener
                    >
                      <ButtonBase
                        onClick={() => onEventClick(event)}
                        aria-label={`${event.title}, etkinlik bilgilerini aç`}
                        sx={{
                          minWidth: 0,
                          minHeight: 44,
                          width: '100%',
                          mb: 0.5,
                          px: 1,
                          borderLeft: '3px solid var(--calendar-accent)',
                          borderRadius: 1,
                          bgcolor: 'var(--calendar-muted)',
                          textAlign: 'left',
                          justifyContent: 'flex-start',
                        }}
                      >
                        <Box
                          sx={{
                            fontSize: 12,
                            fontWeight: 600,
                            lineHeight: 1.4,
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitBoxOrient: 'vertical',
                            WebkitLineClamp: 2,
                            overflowWrap: 'anywhere',
                          }}
                        >
                          {event.title}
                        </Box>
                      </ButtonBase>
                    </Tooltip>
                  ))}
                  {matches.length > 2 && (
                    <ButtonBase
                      onClick={() => onDayClick(day)}
                      sx={{
                        minHeight: 44,
                        width: '100%',
                        fontSize: 12,
                        fontWeight: 600,
                        color: 'var(--calendar-accent)',
                      }}
                    >
                      +{matches.length - 2} etkinlik
                    </ButtonBase>
                  )}
                </>
              )}
            </Box>
          );
        })}
      </Box>
      {compact && (
        <Box sx={{ mt: 3, px: { xs: 2, sm: 0 } }}>
          <Typography
            component="h2"
            sx={{ m: 0, mb: 2, fontSize: '18px !important', fontWeight: 700 }}
          >
            {calendarDay(selectedDate).format('D MMMM dddd')}
          </Typography>
          {selectedEvents.length ? (
            <EventList events={selectedEvents} onEventClick={onEventClick} />
          ) : (
            <Typography component="div" color="text.secondary" sx={{ fontSize: 14 }}>
              Bu gün için etkinlik bulunmuyor.
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
}
