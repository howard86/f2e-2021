import { type City, CitySet } from '@f2e/tdx-core';
import { unstable_cache } from 'next/cache';
import { type GeoJSONMultiLineString, parse } from 'wellknown';

import mock from '@/mock-bike.json';
import {
  BadRequestException,
  handle,
  NotFoundException,
} from '@/services/api-response';
import { bikeService } from '@/services/tdx';
import { roundGeoJson } from '@/services/utils';
import type { BikeCyclingWithGeoJson } from '@/types/api';

export const dynamic = 'force-dynamic';

const ONE_DAY = 86_400;
const CACHE_CONTROL = 'public, s-maxage=604800, stale-while-revalidate=604800';

// Only what the list and cards read, plus Geometry for the map layer.
const SELECT =
  'RouteName,City,CityCode,Town,RoadSectionStart,RoadSectionEnd,CyclingLength,Geometry';

// The city is the cache key (a primitive argument).
const getCachedCyclings = unstable_cache(
  async (city: string) => {
    const results = await bikeService.getCyclingShapeByCity(city as City, {
      filter: 'CyclingLength gt 1000 and Geometry ne null',
      orderBy: 'CyclingLength desc',
      select: SELECT,
      top: 200,
    });

    return results.map(({ Geometry, ...rest }) => ({
      ...rest,
      geoJson: roundGeoJson(parse(Geometry) as GeoJSONMultiLineString),
    })) satisfies BikeCyclingWithGeoJson[];
  },
  ['cyclings:city'],
  { revalidate: ONE_DAY },
);

export function GET(request: Request) {
  return handle(() => {
    const city = new URL(request.url).searchParams.get('city');

    if (typeof city !== 'string') {
      throw new BadRequestException(`Missing city=${city}`);
    }

    // TODO: check supported city list
    if (!CitySet.has(city as City)) {
      throw new NotFoundException(`City=${city} is not in the BIKE_LISTS`);
    }

    if (process.env.NODE_ENV !== 'production') {
      return mock as BikeCyclingWithGeoJson[];
    }

    return getCachedCyclings(city);
  }, CACHE_CONTROL);
}
