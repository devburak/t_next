// component/basic/ContentPageRenderer.js
import Layout from './layout';
import ContentContainer from '../ContentContainer';
import Script from 'next/script';
import Head from 'next/head';
import { getImageUrlFromBodyHtml} from '../utils';

export default function ContentPageRenderer({ htmlContent, data }) {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;
  const canonicalUrl = `${SITE_URL}/${data.slug}`;
  const description = data?.spot || data?.metaDescription || 'TMMOB, Türk Mühendis ve Mimar Odaları Birliği';
  const keywords = data?.keywords?.length > 0 ? data.keywords.join(', ') : 'TMMOB, içerikler, mühendislik, mimarlık';

  const imageUrl = 
  data?.featuredMedia?.url ||
  getImageUrlFromBodyHtml(data?.bodyHtml) ||
  'https://storage.ikon-x.com.tr/default.png';

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
        <meta property="og:image" content={imageUrl} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="article:published_time" content={data?.publishDate} />
        <meta property="article:author" content={data?.author?.name || 'TMMOB'} />

        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": data?.title || 'TMMOB içerik',
            "description": description,
            "image": imageUrl,
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
          })
        }} />
        
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
