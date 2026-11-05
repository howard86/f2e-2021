import { busService } from '@/services/tdx';
import { badRequest, handleApi } from '@/utils/api';
import { loadFixture, serveFixtures } from '@/utils/fixtures';

export const dynamic = 'force-dynamic';

export const GET = (request: Request) =>
  handleApi(() => {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    if (lat === null || lng === null) {
      throw badRequest();
    }

    const latitude = Number.parseFloat(lat);
    const longitude = Number.parseFloat(lng);

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      throw badRequest();
    }

    if (serveFixtures()) {
      return loadFixture.nearby();
    }

    return busService.getBusStationNearBy({
      spatialFilter: `nearby(${latitude}, ${longitude}, 1000)`,
    });
  });
