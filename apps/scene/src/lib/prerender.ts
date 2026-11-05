import { type City, majorCities } from '@f2e/tdx-core';

// Vercel builds (preview and production) prerender the six major cities'
// overview, list and events pages, so the first visitors after a deploy get
// CDN pages instead of a burst of rate-limited TDX calls. The build fetches
// each city's snapshots once and every page of that city reuses them. Other
// builds skip it: at TDX's 5 requests a minute it adds minutes to a build.
const PRERENDER_CITIES: readonly City[] = process.env.VERCEL_ENV
  ? majorCities
  : [];

/** `/[city]` params for the prerendered cities. */
export const cityStaticParams = () =>
  PRERENDER_CITIES.map((city) => ({ city }));

/** `/scenes`, `/restaurants`, `/hotels`: the unfiltered list and each city. */
export const listStaticParams = () =>
  PRERENDER_CITIES.length === 0
    ? []
    : [
        { filters: [] as string[] },
        ...PRERENDER_CITIES.map((city) => ({ filters: [city] })),
      ];

/** `/events`: the unfiltered list and each city's ongoing events. */
export const eventsStaticParams = () =>
  PRERENDER_CITIES.length === 0
    ? []
    : [
        { filters: [] as string[] },
        ...PRERENDER_CITIES.map((city) => ({ filters: ['ongoing', city] })),
      ];
