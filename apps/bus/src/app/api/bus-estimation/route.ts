import type { BusEstimation } from '@f2e/tdx-bus';
import { type City, CitySet } from '@f2e/tdx-core';
import { unstable_cache } from 'next/cache';

import { busService } from '@/services/tdx';
import { badRequest, handleApi, notFound } from '@/utils/api';
import { loadFixture, serveFixtures } from '@/utils/fixtures';

export const dynamic = 'force-dynamic';

const REVALIDATE_SECONDS = 15;
const CACHE_CONTROL = `public, s-maxage=${REVALIDATE_SECONDS}, stale-while-revalidate=${REVALIDATE_SECONDS}`;

// Only the fields the bus client reads. Collection fields (Estimates) must
// stay out of $select: TDX answers 500 to them.
const SELECT = 'StopUID,StopName,Direction,StopStatus,EstimateTime';

type BusEstimationField =
  | 'StopUID'
  | 'StopName'
  | 'Direction'
  | 'StopStatus'
  | 'EstimateTime';
type TrimmedBusEstimation = Pick<BusEstimation, BusEstimationField>;

// Primitive arguments only: they are the cache key, so every viewer of a
// route shares one TDX call per window.
const getCachedEstimations = unstable_cache(
  (city: City, route: string) =>
    busService.getBusEstimationsByCityAndRouteName(city, route, {
      select: SELECT,
    }) as Promise<TrimmedBusEstimation[]>,
  ['bus:estimation'],
  { revalidate: REVALIDATE_SECONDS },
);

export const GET = (request: Request) =>
  handleApi(() => {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city') as City | null;
    const route = searchParams.get('route');

    if (city === null || route === null) {
      throw badRequest();
    }

    if (!CitySet.has(city)) {
      throw notFound();
    }

    if (serveFixtures()) {
      return loadFixture.estimation();
    }

    return getCachedEstimations(city, route);
  }, CACHE_CONTROL);
