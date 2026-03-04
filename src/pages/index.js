import Head from "next/head";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import HomePage from "@/component/basic/homeLayout";
import { buildCanonicalUrl, DEFAULT_META_DESCRIPTION } from "@/lib/seo";
// import fs from "../styles/fs.css"

export default function Home() {
  const canonicalUrl = buildCanonicalUrl();

  return (
    <>
      <Head>
        <title>TMMOB | Türk Mühendis ve Mimar Odaları Birliği</title>
        <meta name="description" content={DEFAULT_META_DESCRIPTION} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content="TMMOB | Türk Mühendis ve Mimar Odaları Birliği" />
        <meta property="og:description" content={DEFAULT_META_DESCRIPTION} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <HomePage />
    </>
  );
}
