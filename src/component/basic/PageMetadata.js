import Head from 'next/head';
import { buildCanonicalUrl, buildMetaDescription, DEFAULT_OG_IMAGE } from '../../lib/seo';
import { serializeJsonLd } from '../../lib/pageMetadata.mjs';

export default function PageMetadata({ title, description, path, image = DEFAULT_OG_IMAGE, type = 'website', jsonLd }) {
  const pageTitle = title.includes('TMMOB') ? title : `${title} | TMMOB`;
  const summary = buildMetaDescription(description || title);
  const canonical = buildCanonicalUrl(path);
  return (
    <Head>
      <title>{pageTitle}</title>
      <meta name="description" content={summary} />
      <link rel="canonical" href={canonical} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={summary} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={image} />
      <meta property="og:image:alt" content={title} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={summary} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content={title} />
      {jsonLd && <script key="page-structured-data" type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />}
    </Head>
  );
}
