// Production builds prerender only the unfiltered /scenes, /restaurants,
// /hotels and /events lists (plus the param-less home page), which read
// nationwide data. City pages render on first request and are then cached:
// prerendering the major cities fetched 24 (type, city) snapshots at TDX's
// 5 requests a minute, and production builds kept failing on 429s. Preview and
// local builds prerender nothing.
const isProductionBuild = process.env.VERCEL_ENV === 'production';

/** `/[city]`: every city renders on first request. */
export const cityStaticParams = () => [];

/** `/scenes`, `/restaurants`, `/hotels`, `/events`: the unfiltered list. */
export const listStaticParams = () =>
  isProductionBuild ? [{ filters: [] as string[] }] : [];
