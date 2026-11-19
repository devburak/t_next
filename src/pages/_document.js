import Document, { Html, Head, Main, NextScript } from 'next/document';
import createEmotionServer from '@emotion/server/create-instance';
import createEmotionCache from '../lib/createEmotionCache';

export default function SiteDocument({ emotionStyleTags }) {
  return (
    <Html lang="tr">
      <Head>
        <meta name="emotion-insertion-point" content="" />
        {emotionStyleTags}
      </Head>
      <body><Main /><NextScript /></body>
    </Html>
  );
}
SiteDocument.getInitialProps = async ctx => {
  const originalRenderPage = ctx.renderPage;
  const cache = createEmotionCache();
  const { extractCriticalToChunks } = createEmotionServer(cache);
  ctx.renderPage = () => originalRenderPage({
    enhanceApp: App => function WithEmotionCache(props) { return <App emotionCache={cache} {...props} />; },
  });
  try {
    const initialProps = await Document.getInitialProps(ctx);
    const chunks = extractCriticalToChunks(initialProps.html);
    return {
      ...initialProps,
      emotionStyleTags: chunks.styles.map(style => (
        <style key={style.key} data-emotion={`${style.key} ${style.ids.join(' ')}`} dangerouslySetInnerHTML={{ __html: style.css }} />
      )),
    };
  } finally { ctx.renderPage = originalRenderPage; }
};
