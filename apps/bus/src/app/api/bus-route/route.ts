import { type City, CitySet } from '@f2e/tdx';

import { busService } from '@/services/tdx';
import { badRequest, handleApi } from '@/utils/api';

export const dynamic = 'force-dynamic';

export const GET = (request: Request) =>
  handleApi(() => {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city') as City | null;
    const route = searchParams.get('route');

    if (city === null || !CitySet.has(city) || route === null) {
      throw badRequest();
    }

    return busService.getBusRoutesByCityAndRouteName(city, route, {
      filter: undefined,
      top: 20,
    });
  });
