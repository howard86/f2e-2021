import { busService } from '@/services/tdx';
import { badRequest, handleApi, roundCoordinate } from '@/utils/api';
import { loadFixture, serveFixtures } from '@/utils/fixtures';

export const dynamic = 'force-dynamic';

const CACHE_CONTROL = 'public, s-maxage=86400, stale-while-revalidate=86400';

export const GET = (request: Request) =>
  handleApi(async () => {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    if (lat === null || lng === null) {
      throw badRequest();
    }

    const parsedLatitude = Number.parseFloat(lat);
    const parsedLongitude = Number.parseFloat(lng);

    if (Number.isNaN(parsedLatitude) || Number.isNaN(parsedLongitude)) {
      throw badRequest();
    }

    const latitude = roundCoordinate(parsedLatitude);
    const longitude = roundCoordinate(parsedLongitude);

    if (serveFixtures()) {
      return loadFixture.nearby();
    }

    const stations = await busService.getBusStationNearBy({
      spatialFilter: `nearby(${latitude}, ${longitude}, 1000)`,
    });

    // Only the fields the nearby view reads.
    return stations.map(
      ({
        StationUID,
        StationName,
        StationPosition,
        LocationCityCode,
        Stops,
      }) => ({
        LocationCityCode,
        StationName,
        StationPosition,
        StationUID,
        Stops: Stops.map(({ StopUID, RouteUID, RouteName }) => ({
          RouteName,
          RouteUID,
          StopUID,
        })),
      }),
    );
  }, CACHE_CONTROL);
