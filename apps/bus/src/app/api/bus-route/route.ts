import { type City, CitySet } from '@f2e/tdx-core';

import { busService } from '@/services/tdx';
import { badRequest, handleApi } from '@/utils/api';
import { loadFixture, serveFixtures } from '@/utils/fixtures';

export const dynamic = 'force-dynamic';

const CACHE_CONTROL = 'public, s-maxage=86400, stale-while-revalidate=86400';

export const GET = (request: Request) =>
  handleApi(() => {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city') as City | null;
    const route = searchParams.get('route');

    if (city === null || !CitySet.has(city) || route === null) {
      throw badRequest();
    }

    if (serveFixtures()) {
      return loadFixture.route();
    }

    return busService.getBusRoutesByCityAndRouteName(city, route, {
      filter: undefined,
      top: 20,
    });
  }, CACHE_CONTROL);
