import { type City, CitySet } from '@f2e/tdx-core';
import { type GeoJSONMultiLineString, parse } from 'wellknown';

import mock from '@/mock-bike.json';
import {
  BadRequestException,
  handle,
  NotFoundException,
} from '@/services/api-response';
import { bikeService } from '@/services/tdx';
import type { BikeCyclingWithGeoJson } from '@/types/api';

export const dynamic = 'force-dynamic';

export function GET(request: Request) {
  return handle(async () => {
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

    const results = await bikeService.getCyclingShapeByCity(city as City, {
      filter: 'CyclingLength gt 1000 and Geometry ne null',
      orderBy: 'CyclingLength desc',
      top: 200,
    });

    return results.map(({ Geometry, ...rest }) => ({
      ...rest,
      geoJson: parse(Geometry) as GeoJSONMultiLineString,
    })) satisfies BikeCyclingWithGeoJson[];
  });
}
