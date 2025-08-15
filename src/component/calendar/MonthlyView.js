import React, { useMemo, useState } from 'react';
import { Grid, Box, Typography, Tooltip, Popover, List, ListItem, ListItemText } from '@mui/material';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';
// 1) Eklentileri import ediyoruz
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isBetween from 'dayjs/plugin/isBetween';

// 2) dayjs'e 'extend' ederek eklentileri aktif hale getiriyoruz
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(isBetween);

const daysOfWeek = ['PZT', 'SAL', 'ÇAR', 'PER', 'CUM', 'CMT', 'PAZ'];

// Etkinlik türüne göre pastel renk eşlemesi
const typeColorMap = {
  meeting: { bg: '#E3F2FD', text: '#0D47A1', border: '#90CAF9' },
  webinar: { bg: '#E8F5E9', text: '#1B5E20', border: '#A5D6A7' },
  training: { bg: '#FFF8E1', text: '#E65100', border: '#FFE082' },
  workshop: { bg: '#F3E5F5', text: '#4A148C', border: '#CE93D8' },
  conference: { bg: '#E0F7FA', text: '#006064', border: '#80DEEA' },
  default: { bg: '#ECEFF1', text: '#263238', border: '#CFD8DC' },
};

const getTypeColors = (type) => typeColorMap[type] || typeColorMap.default;

const MonthlyView = ({ selectedDate, events = [] }) => {
  const router = useRouter();
  const [moreAnchor, setMoreAnchor] = useState(null);
  const [moreEvents, setMoreEvents] = useState([]);
  const [moreTitle, setMoreTitle] = useState('');

  // selectedDate Date veya String gelebilir; dayjs ile kontrol ediyoruz
  const validDate = dayjs(selectedDate).isValid()
    ? dayjs(selectedDate)
    : dayjs();

  // Ayın başlangıcı ve sonu
  const startOfMonth = validDate.startOf('month');
  const endOfMonth = validDate.endOf('month');

  // Pazartesi başlayan grid başlangıç/bitiş hesapları (dayjs day(): 0=PAZ, 1=PZT, ... 6=CMT)
  const startOffset = (startOfMonth.day() + 6) % 7; // Kaç gün geri gidilecek (Pzt=0)
  const gridStart = startOfMonth.subtract(startOffset, 'day');
  const endOffset = (endOfMonth.day() + 6) % 7; // 0..6 (Pzt=0)
  const gridEnd = endOfMonth.add(6 - endOffset, 'day'); // Pazar'a kadar genişlet

  const daysArray = useMemo(() => {
    const totalDays = gridEnd.diff(gridStart, 'day') + 1;
    return Array.from({ length: totalDays }, (_, i) => gridStart.add(i, 'day'));
  }, [gridStart, gridEnd]);

  // Haftalara böl (7'şer gün)
  const weeks = useMemo(() => {
    const chunks = [];
    for (let i = 0; i < daysArray.length; i += 7) {
      chunks.push(daysArray.slice(i, i + 7));
    }
    return chunks;
  }, [daysArray]);

  // Etkinlik detayına yönlendirme
  const handleClick = (eventId) => {
    router.push(`/etkinlik/${eventId}`);
  };

  // Haftalık satırda etkinlikleri lane'lere yerleştirerek, çok-günlüleri birleştirerek döndür
  const buildWeekLanes = (weekStart, weekEnd) => {
    // Bu haftayla kesişen etkinlikleri al
    const weekEvents = (events || []).filter((e) => {
      const s = dayjs(e.startDate).startOf('day');
      const eEnd = e.endDate ? dayjs(e.endDate).startOf('day') : s;
      return (
        // [s, eEnd] ile [weekStart, weekEnd] aralıkları kesişiyor mu?
        s.isSameOrBefore(weekEnd, 'day') && eEnd.isSameOrAfter(weekStart, 'day')
      );
    });

    // Haftalık yerleşim modeline dönüştür
    const items = weekEvents.map((e) => {
      const s = dayjs(e.startDate).startOf('day');
      const eEnd = e.endDate ? dayjs(e.endDate).startOf('day') : s;
      const startCol = Math.max(0, s.diff(weekStart, 'day'));
      const endCol = Math.min(6, eEnd.diff(weekStart, 'day'));
      const span = Math.min(6, endCol) - Math.max(0, startCol) + 1;
      return { event: e, startCol: Math.max(0, startCol), span: Math.max(1, span) };
    });

    // Çakışmaları lane'lere yerleştir (basit greedy)
    const lanes = [];
    items
      .sort((a, b) => a.startCol - b.startCol)
      .forEach((it) => {
        let placed = false;
        for (const lane of lanes) {
          // Bu lane'de çakışan var mı?
          const collision = lane.some((x) => {
            const a1 = x.startCol;
            const a2 = x.startCol + x.span - 1;
            const b1 = it.startCol;
            const b2 = it.startCol + it.span - 1;
            return Math.max(a1, b1) <= Math.min(a2, b2);
          });
          if (!collision) {
            lane.push(it);
            placed = true;
            break;
          }
        }
        if (!placed) lanes.push([it]);
      });

  return { lanes, weekEvents };
  };

  return (
    <Box>
      {/* Üst gün başlıkları */}
      <Grid container spacing={0} sx={{ borderBottom: '1px solid #ddd' }}>
        {daysOfWeek.map((day) => (
          <Grid item xs={12 / 7} key={day} sx={{ borderRight: '1px solid #eee' }}>
            <Typography variant="subtitle2" sx={{ textAlign: 'center', py: 1, color: 'text.secondary' }}>
              {day}
            </Typography>
          </Grid>
        ))}
      </Grid>

      {/* Haftalar */}
      {weeks.map((weekDays, wIdx) => {
        const weekStart = weekDays[0].startOf('day');
        const weekEnd = weekDays[6].startOf('day');
        const { lanes, weekEvents } = buildWeekLanes(weekStart, weekEnd);
        const laneHeight = 22; // px
        const headerHeight = 28; // tarih numaraları alanı
        const maxRows = 3; // Google benzeri görünüm için maksimum satır
        const moreLinkHeight = 18;
        // Gün başına gizli etkinlik sayısı
        const hiddenCounts = new Array(7).fill(0);
        // Lane'ler arasında görünür/gizli ayrımı
        lanes.forEach((lane, laneIdx) => {
          lane.forEach(({ startCol, span }) => {
            if (laneIdx >= maxRows) {
              for (let c = startCol; c < Math.min(7, startCol + span); c++) {
                hiddenCounts[c] += 1;
              }
            }
          });
        });
  const hasAnyHidden = hiddenCounts.some((v) => v > 0);
  const visibleLaneCount = Math.min(maxRows, lanes.length);
  const weekHeight = headerHeight + visibleLaneCount * (laneHeight + 4) + (hasAnyHidden ? moreLinkHeight + 6 : 8);

        return (
          <Box key={`week-${wIdx}`} sx={{ position: 'relative', borderBottom: '1px solid #ddd', minHeight: weekHeight }}>
            {/* Gün hücreleri ve tarih numaraları */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                borderTop: wIdx === 0 ? '1px solid #ddd' : 'none',
              }}
            >
              {weekDays.map((d, i) => (
                <Box
                  key={d.format('YYYY-MM-DD')}
                  sx={{
                    borderRight: i < 6 ? '1px solid #eee' : 'none',
                    height: headerHeight,
                    px: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    bgcolor: d.month() === validDate.month() ? 'background.paper' : '#fafafa',
                  }}
                >
                  <Typography variant="caption" color="text.secondary">{d.date()}</Typography>
                </Box>
              ))}
            </Box>

            {/* Etkinlik şeritleri */}
            <Box sx={{ position: 'relative', mt: 0.5, paddingBottom: `${Math.min(maxRows, lanes.length) * (laneHeight + 4)}px` }}>
              {lanes.slice(0, maxRows).map((lane, laneIdx) =>
                lane.map((it) => {
                  const { event, startCol, span } = it;
                  const colors = getTypeColors(event.eventType);
                  const leftPercent = (startCol / 7) * 100;
                  const widthPercent = (span / 7) * 100;
                  const title = event.title || '';
                  const tooltip = `${title}${event.spot ? ' — ' + event.spot : ''}`;

                  return (
                    <Tooltip key={`${event._id}-${startCol}-${span}`} title={tooltip} arrow>
                      <Box
                        onClick={() => handleClick(event._id)}
                        sx={{
                          position: 'absolute',
                          top: headerHeight + laneIdx * (laneHeight + 4),
                          left: `${leftPercent}%`,
                          width: `${widthPercent}%`,
                          height: laneHeight,
                          bgcolor: colors.bg,
                          color: colors.text,
                          border: `1px solid ${colors.border}`,
                          borderRadius: 1,
                          px: 1,
                          display: 'flex',
                          alignItems: 'center',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          fontSize: 12,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <Box sx={{ textOverflow: 'ellipsis', overflow: 'hidden' }}>{title}</Box>
                      </Box>
                    </Tooltip>
                  );
                })
              )}
            </Box>

            {/* +N daha linkleri */}
    {hasAnyHidden && (
              <Box
                sx={{
                  position: 'absolute',
      top: headerHeight + visibleLaneCount * (laneHeight + 4) + 2,
                  left: 0,
                  right: 0,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  px: 1,
                }}
              >
                {weekDays.map((d, colIdx) => (
                  <Box key={`more-${wIdx}-${colIdx}`} sx={{ px: 1, height: moreLinkHeight, display: 'flex', alignItems: 'center' }}>
                    {hiddenCounts[colIdx] > 0 && (
                      <Typography
                        variant="caption"
                        sx={{ color: 'primary.main', cursor: 'pointer' }}
                        onClick={(e) => {
                          const dayDate = d.startOf('day');
                          const dayEvents = weekEvents.filter((ev) => {
                            const s = dayjs(ev.startDate).startOf('day');
                            const eEnd = ev.endDate ? dayjs(ev.endDate).startOf('day') : s;
                            return dayDate.isSameOrAfter(s, 'day') && dayDate.isSameOrBefore(eEnd, 'day');
                          });
                          setMoreTitle(`${d.format('D MMMM YYYY')}`);
                          setMoreEvents(dayEvents);
                          setMoreAnchor(e.currentTarget);
                        }}
                      >
                        +{hiddenCounts[colIdx]} daha
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        );
      })}

      {/* Daha fazla etkinlik popover */}
      <Popover
        open={Boolean(moreAnchor)}
        anchorEl={moreAnchor}
        onClose={() => setMoreAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Box sx={{ p: 1, minWidth: 260 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>{moreTitle}</Typography>
          <List dense>
            {moreEvents.map((ev) => (
              <ListItem key={ev._id} button onClick={() => handleClick(ev._id)} sx={{ py: 0.5 }}>
                <ListItemText
                  primaryTypographyProps={{ noWrap: true }}
                  primary={ev.title}
                  secondary={ev.spot}
                />
              </ListItem>
            ))}
            {moreEvents.length === 0 && (
              <ListItem>
                <ListItemText primary="Etkinlik yok" />
              </ListItem>
            )}
          </List>
        </Box>
      </Popover>
    </Box>
  );
};

export default MonthlyView;
