import { toPreferredCity } from '@/constants/preferences';
import { BadRequestException, getSingleParam, handleGet } from '@/lib/api';
import { searchPlaces } from '@/services/places';

export const dynamic = 'force-dynamic';

const SUGGESTIONS_PER_TYPE = 4;
const CACHE_CONTROL = 'public, s-maxage=3600, stale-while-revalidate=86400';

export const GET = (request: Request) =>
  handleGet(
    (searchParams) => {
      const keyword = getSingleParam(searchParams, 'q')?.trim();

      if (!keyword) {
        throw new BadRequestException();
      }

      return searchPlaces(
        keyword,
        SUGGESTIONS_PER_TYPE,
        toPreferredCity(getSingleParam(searchParams, 'city')),
      );
    },
    request,
    CACHE_CONTROL,
  );
