import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { Box, Button, IconButton, Stack, Typography } from '@mui/material';
import ChevronLeftRounded from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRounded from '@mui/icons-material/ChevronRightRounded';
import CalendarTodayOutlined from '@mui/icons-material/CalendarTodayOutlined';
import CalendarView from '../../component/calendar/CalendarView';
import CalendarSubscription from '../../component/calendar/CalendarSubscription';
import CalendarStatus from '../../component/calendar/CalendarStatus';
import useCalendarEvents from '../../component/calendar/useCalendarEvents';
import { calendarButtonSx, calendarUiSx } from '../../component/calendar/calendarStyles';
import {
  calendarDay,
  calendarRange,
  calendarToday,
  eventInstant,
  loadCalendarEvents,
  parseCalendarRoute,
} from '../../lib/calendar.mjs';
import Header from '../../component/basic/header';
import TopMenu from '../../component/basic/topMenu';
import Chambers from '../../component/basic/chambers';
import Footer from '../../component/basic/footer';
import { buildCanonicalUrl } from '../../lib/seo';

const DynamicCalendar = dynamic(() => import('../../component/calendar'), { ssr: false });
function CalendarPage({ initialEvents, initialError, initialView, initialSelectedDate }) {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(() => calendarDay(initialSelectedDate));
  const { events, loading, error, retry } = useCalendarEvents(currentDate, initialView, {
    initialEvents,
    initialError,
  });
  const navigate = (date, view = initialView) => {
    const target = calendarDay(date),
      path = `/takvim/${target.format(view === 'monthly' ? 'YYYY/MM' : 'YYYY/MM/DD')}`;
    router.push(view === 'weekly' ? `${path}?view=weekly` : path);
  };
  const heading =
    initialView === 'daily'
      ? currentDate.format('D MMMM YYYY')
      : initialView === 'weekly'
        ? `${eventInstant(calendarRange(currentDate, 'weekly').startDate).format('D MMMM')} – ${eventInstant(calendarRange(currentDate, 'weekly').endDate).format('D MMMM YYYY')}`
        : currentDate.format('MMMM YYYY');
  return (
    <>
      <Head>
        <title>{`${heading} Etkinlik Takvimi | TMMOB`}</title>
        <meta
          name="description"
          content="TMMOB etkinliklerini gün, hafta ve ay görünümünde inceleyin; kendi takviminize ekleyin."
        />
        <link
          rel="canonical"
          href={buildCanonicalUrl(`/takvim/${currentDate.format('YYYY/MM')}`)}
        />
      </Head>
      <Header />
      <TopMenu />
      <Box className="site-shell site-shell--content" sx={calendarUiSx}>
        <Box
          sx={{
            bgcolor: 'var(--calendar-surface)',
            border: '1px solid var(--calendar-border)',
            borderRadius: { xs: 0, sm: 4 },
            mx: { xs: -2, sm: 0 },
            overflow: 'hidden',
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', sm: 'center' }}
            sx={{ p: { xs: 2, md: 3 }, borderBottom: '1px solid var(--calendar-border)' }}
          >
            <Box>
              <Typography
                component="div"
                variant="overline"
                sx={{ color: 'var(--calendar-accent)', letterSpacing: '0.1em' }}
              >
                TMMOB ETKİNLİKLERİ
              </Typography>
              <Typography
                component="h1"
                sx={{
                  m: 0,
                  fontSize: '28px !important',
                  lineHeight: '1.3 !important',
                  fontWeight: 700,
                }}
              >
                Etkinlik takvimi
              </Typography>
            </Box>
            <Button
              startIcon={<CalendarTodayOutlined />}
              variant="outlined"
              onClick={() => navigate(calendarToday())}
              sx={calendarButtonSx}
            >
              Bugüne git
            </Button>
          </Stack>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'minmax(0,1fr)', lg: '360px minmax(0,1fr)' },
            }}
          >
            <Box
              sx={{
                p: 2,
                borderRight: { lg: '1px solid var(--calendar-border)' },
                display: { xs: 'none', lg: 'block' },
              }}
            >
              <DynamicCalendar
                key={currentDate.format('YYYY-MM')}
                value={currentDate}
                events={events}
                loading={loading}
                error={error}
                onRetry={retry}
                onChange={(date) => navigate(date, 'daily')}
                onMonthChange={(date) => navigate(date, 'monthly')}
              />
              <CalendarSubscription year={currentDate.year()} />
            </Box>
            <Box sx={{ p: { xs: 0, sm: 3 }, minWidth: 0 }}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 2 }}
              >
                <IconButton
                  aria-label={
                    initialView === 'monthly'
                      ? 'Önceki ay'
                      : initialView === 'weekly'
                        ? 'Önceki hafta'
                        : 'Önceki gün'
                  }
                  onClick={() =>
                    navigate(
                      currentDate.subtract(
                        1,
                        initialView === 'monthly'
                          ? 'month'
                          : initialView === 'weekly'
                            ? 'week'
                            : 'day'
                      )
                    )
                  }
                  sx={{ width: 44, height: 44 }}
                >
                  <ChevronLeftRounded />
                </IconButton>
                <Typography
                  component="h2"
                  sx={{ m: 0, fontSize: '20px !important', fontWeight: 700, textAlign: 'center' }}
                >
                  {heading}
                </Typography>
                <IconButton
                  aria-label={
                    initialView === 'monthly'
                      ? 'Sonraki ay'
                      : initialView === 'weekly'
                        ? 'Sonraki hafta'
                        : 'Sonraki gün'
                  }
                  onClick={() =>
                    navigate(
                      currentDate.add(
                        1,
                        initialView === 'monthly'
                          ? 'month'
                          : initialView === 'weekly'
                            ? 'week'
                            : 'day'
                      )
                    )
                  }
                  sx={{ width: 44, height: 44 }}
                >
                  <ChevronRightRounded />
                </IconButton>
              </Stack>
              <CalendarStatus loading={loading} error={error} onRetry={retry} />
              {!loading && !error && (
                <CalendarView
                  events={events}
                  initialView={initialView}
                  selectedDate={currentDate}
                  setView={(view) => navigate(currentDate, view)}
                  onDateChange={date => { if (!date.isSame(currentDate, 'month')) navigate(date, initialView); else setCurrentDate(date); }}
                />
              )}
              <Box sx={{ display: { xs: 'block', lg: 'none' } }}>
                <CalendarSubscription year={currentDate.year()} />
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
      <Chambers />
      <Footer />
    </>
  );
}
export default function CalendarRoute(props) {
  return <CalendarPage key={`${props.initialSelectedDate}/${props.initialView}`} {...props} />;
}
export async function getServerSideProps({ params = {}, query = {} }) {
  const parsed = parseCalendarRoute(params.params || [], query.view);
  if (!parsed) return { notFound: true };
  let initialEvents = [],
    initialError = '';
  try {
    initialEvents = await loadCalendarEvents(
      process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL,
      calendarRange(parsed.date, parsed.view),
      { signal: AbortSignal.timeout(15000) }
    );
  } catch {
    initialError = 'Etkinlikler şu anda yüklenemiyor. Lütfen tekrar deneyin.';
  }
  return {
    props: {
      initialEvents,
      initialError,
      initialView: parsed.view,
      initialSelectedDate: parsed.date.format('YYYY-MM-DD'),
    },
  };
}
