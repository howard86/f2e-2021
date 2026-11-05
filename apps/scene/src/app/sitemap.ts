import { Cities } from '@f2e/tdx-core';
import type { MetadataRoute } from 'next';

import { ALL_CITIES } from '@/constants/preferences';
import { eventsPath, listPath } from '@/lib/list-paths';
import { SITE_URL } from '@/lib/seo';
import { getTagOptionsFor } from '@/services/place-queries';

type Entry = MetadataRoute.Sitemap[number];

const LIST_TYPES = ['scene', 'restaurant', 'hotel'] as const;

const entry = (
  path: string,
  priority: number,
  changeFrequency: Entry['changeFrequency'] = 'daily',
): Entry => ({
  changeFrequency,
  priority,
  url: new URL(path, SITE_URL).href,
});

/** Static routes only: detail pages would need thousands of TDX calls. */
const sitemap = (): MetadataRoute.Sitemap => {
  const cities = [ALL_CITIES, ...Cities] as const;

  return [
    entry('/', 1),
    entry('/transports', 0.3, 'monthly'),
    ...Cities.map((city) => entry(`/${city}`, 0.8)),
    ...LIST_TYPES.flatMap((type) => [
      entry(listPath({ type }), 0.7),
      ...Cities.map((city) => entry(listPath({ city, type }), 0.6)),
      ...getTagOptionsFor(type).flatMap(({ value }) =>
        cities.map((city) =>
          entry(listPath({ city, tag: value, type }), 0.4, 'weekly'),
        ),
      ),
    ]),
    entry(eventsPath({}), 0.7),
    ...Cities.map((city) => entry(eventsPath({ city }), 0.6)),
  ];
};

export default sitemap;
