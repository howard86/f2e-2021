// Recorded TDX snapshots for `next dev`: with shouldUseTdxFixtures() the data
// layer reads these instead of calling TDX, so local work spends none of the
// shared 5 requests a minute. Loaded with dynamic imports, one chunk per
// city, so a production server never loads them. A city without a fixture
// reads as an empty city (the pages' normal "nothing found" state).
import type { City } from '@f2e/tdx-core';
import { shouldUseTdxFixtures } from '@f2e/tdx-core';

import type { PlaceRecord } from '@/services/place-mappers';
import type { PlaceType } from '@/types/place';

type FixtureFile = Partial<Record<PlaceType, PlaceRecord[]>>;

const LOADERS: Partial<Record<City, () => Promise<{ default: unknown }>>> = {
  Keelung: () => import('@/fixtures/Keelung.json'),
  Taipei: () => import('@/fixtures/Taipei.json'),
};

export const fixturesEnabled = () => shouldUseTdxFixtures(process.env);

const fixtureCities = () => Object.keys(LOADERS) as City[];

export const fixtureSnapshot = async (
  type: PlaceType,
  city: City,
): Promise<PlaceRecord[]> => {
  const load = LOADERS[city];

  if (!load) {
    return [];
  }

  const file = (await load()).default as FixtureFile;

  return file[type] ?? [];
};

/** Every recorded record of a type, for queries that name no city. */
export const fixtureRecords = async (type: PlaceType) =>
  (
    await Promise.all(
      fixtureCities().map((city) => fixtureSnapshot(type, city)),
    )
  ).flat();
