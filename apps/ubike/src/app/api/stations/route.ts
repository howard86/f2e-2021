import mock from '@/mock.json';
import { BadRequestException, handle } from '@/services/api-response';
import { bikeService } from '@/services/tdx';
import { mergeStationAvailability, roundTo } from '@/services/utils';
import type { NormalisedBikeStation } from '@/types/api';

export const dynamic = 'force-dynamic';

const CACHE_CONTROL = 'public, s-maxage=30, stale-while-revalidate=30';

export function GET(request: Request) {
  return handle(async () => {
    const params = new URL(request.url).searchParams;
    const lat = params.get('lat');
    const lng = params.get('lng');
    const r = params.get('r');

    if (lat === null || lng === null || r === null) {
      throw new BadRequestException(`Incorrect lat=${lat} or ${lng} or r=${r}`);
    }

    const latitude = Number.parseFloat(lat);
    const longitude = Number.parseFloat(lng);
    const radius = Number.parseFloat(r);

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      throw new BadRequestException(`Incorrect lat=${lat} or ${lng}`);
    }

    if (Number.isNaN(radius) || radius < 500 || radius > 1000) {
      throw new BadRequestException(`Invalid input of radius ${radius}`);
    }

    if (process.env.NODE_ENV !== 'production') {
      return mock as unknown as NormalisedBikeStation;
    }

    // About 100m: nearby requests share a cache entry.
    const spatialFilter = `nearby(${roundTo(latitude, 3)}, ${roundTo(longitude, 3)}, ${radius})`;

    const [stations, bikes] = await Promise.all([
      bikeService.getNearByBikeStations({
        select: 'StationUID,StationName,StationAddress,StationPosition',
        spatialFilter,
        top: 30,
      }),
      bikeService.getNearByBikesAvailability({
        select:
          'StationUID,ServiceStatus,AvailableRentBikes,AvailableReturnBikes',
        spatialFilter,
        top: 30,
      }),
    ]);

    const normalised: NormalisedBikeStation = mergeStationAvailability(
      stations,
      bikes,
    );

    return normalised;
  }, CACHE_CONTROL);
}
