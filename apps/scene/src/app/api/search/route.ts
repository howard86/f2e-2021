import { BadRequestException, getSingleParam, handleGet } from '@/lib/api';
import { searchPlaces } from '@/services/places';

export const dynamic = 'force-dynamic';

const SUGGESTIONS_PER_TYPE = 4;

export const GET = (request: Request) =>
  handleGet((searchParams) => {
    const keyword = getSingleParam(searchParams, 'q')?.trim();

    if (!keyword) {
      throw new BadRequestException();
    }

    return searchPlaces(keyword, SUGGESTIONS_PER_TYPE);
  }, request);
