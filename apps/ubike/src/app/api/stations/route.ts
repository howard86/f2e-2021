import mock from '@/mock.json';
import { BadRequestException, handle } from '@/services/api-response';
import { bikeService } from '@/services/tdx';
import type { NormalisedBikeStation } from '@/types/api';

export const dynamic = 'force-dynamic';

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

    const [stations, bikes] = await Promise.all([
      bikeService.getNearByBikeStations({
        spatialFilter: `nearby(${latitude}, ${longitude}, ${radius})`,
        top: 30,
      }),
      bikeService.getNearByBikesAvailability({
        spatialFilter: `nearby(${latitude}, ${longitude}, ${radius})`,
        top: 30,
      }),
    ]);

    const normalised: NormalisedBikeStation = { entities: {}, uids: [] };

    for (let i = 0; i < stations.length; i += 1) {
      const station = stations[i];
      const bike = bikes[i];

      if (bike.ServiceStatus === 1) {
        normalised.uids.push(bike.StationUID);
        normalised.entities[bike.StationUID] = {
          ...station,
          ...bike,
        };
      }
    }

    return normalised;
  });
}
