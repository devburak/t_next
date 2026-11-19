import dynamic from 'next/dynamic';

// Keep the large Drupal compatibility stylesheet in its own async CSS entry.
// SSR stays enabled so CMS content and its styles are present without JavaScript.
export default dynamic(() => import('./LegacyContentBody'));
