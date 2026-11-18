import ContentHtml from '../../component/ContentHtml';
import { useRouter } from 'next/router';
import { Box, Container, Typography } from '@mui/material';
import EventSummary from '../../component/calendar/EventSummary';
import { calendarUiSx } from '../../component/calendar/calendarStyles';
import Layout from '../../component/basic/layout'; // Layout bileşeninin yolu
// import { getEventById } from '@/api';
import Head from 'next/head';
import { getImageUrlFromBodyHtml } from '../../component/utils';
import {
  buildCanonicalUrl,
  buildMetaDescription,
  DEFAULT_META_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  getSiteUrl,
  toIsoDate,
} from '../../lib/seo';

const EventDetailPage = ({ event }) => {
  const router = useRouter();

  // Eğer veri yükleniyor veya router hazır değilse
  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  const imageUrl = getImageUrlFromBodyHtml(event?.bodyHtml) || DEFAULT_OG_IMAGE;

  const canonicalUrl = buildCanonicalUrl(`/etkinlik/${event._id}`);
  const description = buildMetaDescription(
    event?.spot || event?.bodyHtml,
    DEFAULT_META_DESCRIPTION
  );
  const keywords =
    event?.keywords?.length > 0
      ? event.keywords.join(', ')
      : event?.title
        ? event.title.split(' ').join(', ')
        : 'TMMOB, etkinlikler, mühendislik, mimarlık';

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event?.title || 'TMMOB Etkinliği',
    description: description,
    startDate: toIsoDate(event?.startDate),
    endDate: toIsoDate(event?.endDate || event?.startDate),
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: event?.location
      ? 'https://schema.org/OfflineEventAttendanceMode'
      : 'https://schema.org/OnlineEventAttendanceMode',
    image: [imageUrl],
    organizer: {
      '@type': 'Organization',
      name: 'TMMOB',
      url: getSiteUrl(),
    },
    ...(event?.location
      ? {
          location: {
            '@type': 'Place',
            name: event.location,
            address: event.location,
          },
        }
      : {}),
  };

  return (
    <Layout RigthSide={true}>
      <Head>
        {/* Dinamik SEO Meta Etiketleri */}
        <title>{event?.title || 'TMMOB içerik'}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta name="author" content={event?.createdBy?.name || 'TMMOB'} />
        <link rel="canonical" href={canonicalUrl} />

        {/* Open Graph Etiketleri */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={event?.title || 'TMMOB içerik'} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:url" content={canonicalUrl} />

        {/* Yapılandırılmış Veri */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={calendarUiSx}>
          <Typography
            component="h1"
            sx={{
              m: 0,
              mb: 3,
              fontSize: '28px !important',
              lineHeight: '1.35 !important',
              fontWeight: 700,
              overflowWrap: 'anywhere',
            }}
          >
            {event.title}
          </Typography>
          <Box
            sx={{
              p: { xs: 2, md: 3 },
              border: '1px solid var(--calendar-border)',
              borderRadius: 4,
              bgcolor: 'var(--calendar-surface)',
            }}
          >
            <EventSummary event={event} showTitle={false} showDetailLink={false} />
          </Box>
        </Box>
        <Container
          maxWidth="md"
          sx={{
            mt: 2,
            p: 2,
            backgroundColor: '#f9f9f9',
            borderRadius: '8px',
            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
          }}
        >
          <ContentHtml html={event.bodyHtml} />
        </Container>
      </Container>
    </Layout>
  );
};

export default EventDetailPage;

const apiBaseUrl = process.env.API_BASE_URL;
export async function getServerSideProps(context) {
  const { id } = context.params;

  try {
    // Backend'den etkinlik detayını getir
    const res = await fetch(`${apiBaseUrl}/events/${id}`);
    if (!res.ok) return { notFound: true };
    const event = await res.json();
    if (!event?._id) return { notFound: true };
    return {
      props: {
        event,
      },
    };
  } catch (error) {
    console.error('Etkinlik detayını getirirken hata:', error);
    return {
      notFound: true,
    };
  }
}
