import Document, { Html, Head, Main, NextScript } from 'next/document';
import createEmotionServer from '@emotion/server/create-instance';
import createEmotionCache from '../lib/createEmotionCache';
import { Children, cloneElement, createElement, isValidElement } from 'react';

// Next already schedules its runtime. Keep Rocket Loader from rescheduling it.
function frameworkScripts(nodes) {
  return Children.map(nodes, node => {
    if (!isValidElement(node)) return node;
    if (node.type === 'script') {
      return createElement('script', { 'data-cfasync': 'false', ...node.props, key: node.key });
    }
    return node.props.children === undefined ? node : cloneElement(node, undefined, frameworkScripts(node.props.children));
  });
}
class FrameworkHead extends Head {
  render() { return frameworkScripts(super.render()); }
}
class FrameworkScripts extends NextScript {
  render() { return frameworkScripts(super.render()); }
}

export default function SiteDocument({ emotionStyleTags }) {
  return (
    <Html lang="tr">
      <FrameworkHead>
        <meta name="emotion-insertion-point" content="" />
        {emotionStyleTags}
      </FrameworkHead>
      <body><Main /><FrameworkScripts /></body>
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
