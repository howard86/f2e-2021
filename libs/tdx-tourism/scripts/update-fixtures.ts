// Refreshes fixtures/*.json: small samples of raw TDX Tourism V2 responses
// (before TourismService maps them) for local development and mapper tests.
// Each sample is picked to cover the field shapes the UI has to handle, so
// keep the cases below in step with what the scene pages render.
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { TdxService } from '@f2e/tdx-core';

import {
  type Attraction,
  type Event,
  type Hotel,
  type Restaurant,
  tourism0101,
  tourism0201,
  tourism0301,
  tourism0701,
} from '../generated/tourism-v2';
import { createClient, createConfig } from '../generated/tourism-v2/client';

const ROOT = new URL('../../..', import.meta.url).pathname;
const FIXTURES_DIR = new URL('../fixtures', import.meta.url).pathname;
const POOL_SIZE = 100;
const SAMPLE_SIZE = 8;

process.loadEnvFile(join(ROOT, '.env.local'));

const service = new TdxService({
  baseUrl: process.env.TDX_BASE_URL,
  clientId: process.env.TDX_CLIENT_ID,
  clientSecret: process.env.TDX_CLIENT_SECRET,
});
const client = service.createClient('tourism', (options) =>
  createClient(createConfig(options)),
);

type Case<T> = [name: string, matches: (item: T) => boolean];

const hasImages = (item: { Images?: { URL?: string }[] }) =>
  Boolean(item.Images?.some((image) => image.URL));

/** Takes the first item for each case, then tops up to SAMPLE_SIZE in order. */
const pick = <T>(items: T[], cases: Case<T>[]) => {
  const picked = new Set<T>();

  for (const [name, matches] of cases) {
    const item = items.find((candidate) => matches(candidate));

    if (item) {
      picked.add(item);
    } else {
      console.warn(`  no item for case: ${name}`);
    }
  }

  for (const item of items) {
    if (picked.size >= SAMPLE_SIZE) {
      break;
    }
    picked.add(item);
  }

  return [...picked];
};

const save = async <T>(file: string, items: T[], cases: Case<T>[]) => {
  const sample = pick(items, cases);

  await writeFile(
    join(FIXTURES_DIR, file),
    `${JSON.stringify({ value: sample }, null, 2)}\n`,
  );
  console.log(`${file}: ${sample.length} of ${items.length}`);
};

const fetchValue = async <T>(
  operation: typeof tourism0101,
  orderBy: string,
) => {
  const { data } = await operation({
    client,
    query: { $orderby: orderBy, $top: POOL_SIZE },
    throwOnError: true,
  });

  return ((data as { value?: T[] }).value ?? []) as T[];
};

await mkdir(FIXTURES_DIR, { recursive: true });

const now = Date.now();

await save<Attraction>(
  'attractions.json',
  await fetchValue<Attraction>(tourism0101, 'UpdateTime desc'),
  [
    ['several images', (item) => (item.Images?.length ?? 0) > 1],
    ['no images', (item) => !hasImages(item)],
    ['long traffic info', (item) => (item.TrafficInfo?.length ?? 0) > 1000],
    ['parking info', (item) => Boolean(item.ParkingInfo)],
    ['tags', (item) => (item.Tags?.length ?? 0) > 0],
    ['several classes', (item) => (item.AttractionClasses?.length ?? 0) > 1],
    [
      'map url that is not a map',
      (item) => Boolean(item.MapURLs?.some((url) => !url.includes('map'))),
    ],
  ],
);

await save<Restaurant>(
  'restaurants.json',
  await fetchValue<Restaurant>(tourism0201, 'UpdateTime desc'),
  [
    ['images', hasImages],
    ['no images', (item) => !hasImages(item)],
    ['service time', (item) => Boolean(item.ServiceTimeInfo)],
    ['website', (item) => Boolean(item.WebsiteUrl)],
  ],
);

await save<Hotel>(
  'hotels.json',
  await fetchValue<Hotel>(tourism0301, 'UpdateTime desc'),
  [
    ['starred', (item) => (item.HotelStars ?? 0) > 0],
    ['unstarred', (item) => !item.HotelStars],
    ['room info', (item) => Boolean(item.RoomInfo)],
    ['service info', (item) => Boolean(item.ServiceInfo)],
    ['images', hasImages],
    ['no images', (item) => !hasImages(item)],
    ['website', (item) => Boolean(item.WebsiteUrl)],
  ],
);

await save<Event>(
  'events.json',
  await fetchValue<Event>(tourism0701, 'StartDateTime desc'),
  [
    [
      'upcoming',
      (item) =>
        Boolean(item.StartDateTime) &&
        Date.parse(item.StartDateTime as string) > now,
    ],
    [
      'ongoing',
      (item) =>
        Boolean(item.StartDateTime && item.EndDateTime) &&
        Date.parse(item.StartDateTime as string) <= now &&
        Date.parse(item.EndDateTime as string) >= now,
    ],
    [
      'ended',
      (item) =>
        Boolean(item.EndDateTime) &&
        Date.parse(item.EndDateTime as string) < now,
    ],
    ['organizer', (item) => (item.Organizations?.length ?? 0) > 0],
    ['website', (item) => Boolean(item.WebsiteUrl)],
  ],
);
