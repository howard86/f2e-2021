import { constructRestaurantsSearch } from '@f2e/tdx-tourism';

import {
  BadRequestException,
  getSingleParam,
  handleGet,
  NotFoundException,
} from '@/lib/api';
import { mapRestaurantToPlaceCard, tourismService } from '@/services/tdx';

export const dynamic = 'force-dynamic';

export const GET = (request: Request) =>
  handleGet(async (searchParams) => {
    const keyword = getSingleParam(searchParams, 'keyword');

    if (keyword === undefined) {
      throw new BadRequestException();
    }

    const results = await tourismService.getRestaurants({
      filter: `Picture/PictureUrl1 ne null and City ne null and (${constructRestaurantsSearch(
        keyword,
      )})`,
      orderBy: 'SrcUpdateTime desc, Description desc',
      select: 'RestaurantID,RestaurantName,City,Address,OpenTime,Phone,Picture',
      top: 30,
    });

    if (results.length === 0) {
      throw new NotFoundException();
    }

    return results.map(mapRestaurantToPlaceCard);
  }, request);
