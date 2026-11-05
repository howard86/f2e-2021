import type { Metadata } from 'next';

export const SITE_NAME = 'Iro Bus';

/**
 * A page's `openGraph` replaces the layout's whole object, so pages that set
 * their own og:title spread this to keep the site name, locale and image.
 */
export const OPEN_GRAPH_BASE = {
  images: [{ alt: SITE_NAME, height: 567, url: '/preview.jpg', width: 830 }],
  locale: 'zh_TW',
  siteName: SITE_NAME,
  type: 'website',
} satisfies NonNullable<Metadata['openGraph']>;
