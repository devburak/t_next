import Layout from '../component/basic/layout';  // Layout bileşeninin yolu
import ContentContainer from '../component/ContentContainer';
import Script from 'next/script';
import Head from 'next/head';
import dayjs from 'dayjs';

function DynamicContentPage({ htmlContent, data, jsonContent = null }) {

  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;
  const canonicalUrl = `${SITE_URL}/${data.slug}`;
  const description = data?.spot || data?.metaDescription || 'TMMOB, Türk Mühendis ve Mimar Odaları Birliği';
  const keywords = data?.keywords?.length > 0 ? data.keywords.join(', ') : 'TMMOB, içerikler, mühendislik, mimarlık';


  return (
    <Layout RigthSide={true}>
      <Head>
        <title>{data?.title || 'TMMOB içerik'}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta name="author" content={data?.author?.name || 'TMMOB'} />
        <link rel="canonical" href={canonicalUrl} />

        <meta property="og:type" content="article" />
        <meta property="og:title" content={data?.title || 'TMMOB içerik'} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={data?.featuredMedia?.url || 'https://storage.ikon-x.com.tr/default.png'} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="article:published_time" content={data?.publishDate} />
        <meta property="article:author" content={data?.author?.name || 'TMMOB'} />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": data?.title || 'TMMOB içerik',
            "description": description,
            "image": data?.featuredMedia?.url || "https://storage.ikon-x.com.tr/default.png",
            "author": {
              "@type": "Organization",
              "name": "TMMOB",
              "url": "https://tmmob.org.tr",
              "logo": {
                "@type": "ImageObject",
                "url": "https://storage.ikon-x.com.tr/default.png"
              }
            },
            "datePublished": data?.publishDate,
            "dateModified": data?.updatedAt,
          })}
        </script>
      </Head>

      <ContentContainer
        title={data?.title || ""}
        featuredMedia={data.featuredMedia}
        publishDate={data.publishDate}
        spot={data?.spot || ""}
        htmlContent={htmlContent}
      />
      <Script id="carusel-js" type="text/javascript" src="/js/carousel.js" strategy="lazyOnload" />
    </Layout>
  );
}

const apiBaseUrl = process.env.API_BASE_URL;

export async function getServerSideProps({ params }) {
  const { slug } = params;  // URL'den 'slug' parametresini al
  // Eğer 'takvim' slug'ı gelirse, takvim rotasına yönlendir

  if (slug === 'takvim') {
    const currentYear = dayjs().year(); // Geçerli yılı al
    const currentMonth = dayjs().month() + 1; // Geçerli ayı al (0-11 aralığında olduğu için +1 ekliyoruz)

    return {
      redirect: {
        destination: `/takvim/${currentYear}/${currentMonth}`,
        permanent: false,
      },
    };
  }
  try {
    // API'den veri çekme işlemi
    const res = await fetch(`${apiBaseUrl}/contents/slug/${slug}`);
    if (!res.ok) {
      // İçerik bulunamazsa veya hata alırsa 404 sayfasına yönlendirilir
      return {
        notFound: true,
      };
    }

    const data = await res.json();

    // HTML içeriğini serialize ederek dönüştür
    // const htmlContent = serialize(data.bodyHtml);
    const htmlContent = data.bodyHtml || '';
    return {
      props: { htmlContent, data },  // Sayfa bileşenine veriyi aktar
    };
  } catch (error) {
    console.error("Veri çekme hatası:", error);
    return {
      notFound: true,
    };
  }
}

export default DynamicContentPage;
