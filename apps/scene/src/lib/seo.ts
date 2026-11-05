import type { Metadata } from 'next';

export const SITE_NAME = '台灣旅遊導覽網';

// The production domain, not the per-deploy URL: deploy URLs sit behind Vercel
// SSO, so crawlers fetching og:image or canonical links there get a login page.
const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;

export const SITE_URL = new URL(
  productionHost ? `https://${productionHost}` : 'http://localhost:3000',
);

/** The `public/static/background/*.png` heroes are all 1280×700. */
export const backgroundImage = (name: string, alt: string) => ({
  alt,
  height: 700,
  url: `/static/background/${name}.png`,
  width: 1280,
});

/** Share image used when a page has no image of its own. */
export const DEFAULT_OG_IMAGE = backgroundImage('main', SITE_NAME);

/**
 * A page's `openGraph` replaces the layout's whole object, so every page
 * spreads this to keep og:site_name, og:locale and og:type.
 */
export const OPEN_GRAPH_BASE = {
  locale: 'zh_TW',
  siteName: SITE_NAME,
  type: 'website',
} satisfies NonNullable<Metadata['openGraph']>;

export const TWITTER_BASE = {
  card: 'summary_large_image',
} satisfies NonNullable<Metadata['twitter']>;
