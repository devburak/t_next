// component/basic/ContentPageRenderer.js
import Layout from './layout';
import ContentContainer from '../ContentContainer';
import Script from 'next/script';
import Head from 'next/head';
import { getImageUrlFromBodyHtml} from '../utils';
import {
  buildCanonicalUrl,
  buildMetaDescription,
  DEFAULT_META_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  toIsoDate,
} from '../../lib/seo';

export default function ContentPageRenderer({
  htmlContent,
  data,
  canonicalPath = '',
  metaRobots = '',
  showPublishDate = true,
}) {
  const canonicalUrl = buildCanonicalUrl(
    canonicalPath || (data?.slug ? `/${data.slug}` : '')
  );
  const description = buildMetaDescription(
    data?.spot || data?.metaDescription || data?.bodyHtml,
    DEFAULT_META_DESCRIPTION
  );
  const keywords = data?.keywords?.length > 0 ? data.keywords.join(', ') : 'TMMOB, içerikler, mühendislik, mimarlık';
  const seoTitle = data?.title ? `${data.title} | TMMOB` : 'TMMOB içerik';
  const authorName = data?.author?.name || 'TMMOB';
  const publishedTime = toIsoDate(data?.publishDate);
  const modifiedTime = toIsoDate(data?.updatedAt || data?.publishDate);
  const isArticle = showPublishDate && Boolean(publishedTime);

  const imageUrl = 
  data?.featuredMedia?.url ||
  getImageUrlFromBodyHtml(data?.bodyHtml) ||
  DEFAULT_OG_IMAGE;

  return (
    <Layout RigthSide={true}>
     
      <Head>
        <title>{seoTitle}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta name="author" content={authorName} />
        {metaRobots ? <meta name="robots" content={metaRobots} /> : null}
        <link rel="canonical" href={canonicalUrl} />

        <meta property="og:site_name" content="TMMOB" />
        <meta property="og:locale" content="tr_TR" />
        <meta property="og:type" content={isArticle ? 'article' : 'website'} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:image:alt" content={data?.title || 'TMMOB içerik'} />
        <meta property="og:url" content={canonicalUrl} />
        <meta name="twitter:card" content={imageUrl ? 'summary_large_image' : 'summary'} />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={imageUrl} />
        <meta name="twitter:image:alt" content={data?.title || 'TMMOB içerik'} />
        {isArticle ? <meta property="article:published_time" content={publishedTime} /> : null}
        {isArticle && modifiedTime ? <meta property="article:modified_time" content={modifiedTime} /> : null}
        {isArticle ? <meta property="article:author" content={authorName} /> : null}

        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": isArticle ? "Article" : "WebPage",
            "mainEntityOfPage": canonicalUrl,
            "headline": data?.title || 'TMMOB içerik',
            "url": canonicalUrl,
            "description": description,
            "image": imageUrl,
            "author": {
              "@type": "Organization",
              "name": "TMMOB",
              "url": "https://tmmob.org.tr",
              "logo": {
                "@type": "ImageObject",
                "url": DEFAULT_OG_IMAGE
              }
            },
            "datePublished": publishedTime,
            "dateModified": modifiedTime,
          })
        }} />
        
      </Head>

      <ContentContainer
        title={data?.title || ""}
        featuredMedia={data?.featuredMedia}
        publishDate={data?.publishDate}
        spot={data?.spot || ""}
        htmlContent={htmlContent}
        showPublishDate={showPublishDate}
        shareUrl={canonicalUrl}
      />
      <Script id="carusel-js" type="text/javascript" src="/js/carousel.js" strategy="lazyOnload" />
    </Layout>
  );
}
