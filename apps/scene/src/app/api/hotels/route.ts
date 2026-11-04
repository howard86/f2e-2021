import { constructHotelsSearch } from '@f2e/tdx';

import {
  BadRequestException,
  getSingleParam,
  handleGet,
  NotFoundException,
} from '@/lib/api';
import { mapHotelToPlaceCard, tourismService } from '@/services/tdx';

export const dynamic = 'force-dynamic';

export const GET = (request: Request) =>
  handleGet(async (searchParams) => {
    const keyword = getSingleParam(searchParams, 'keyword');

    if (keyword === undefined) {
      throw new BadRequestException();
    }

    const results = await tourismService.getHotels({
      filter: `Picture/PictureUrl1 ne null and City ne null and (${constructHotelsSearch(
        keyword,
      )})`,
      orderBy: 'SrcUpdateTime desc, ServiceInfo desc',
      select: 'HotelID,HotelName,City,Address,ServiceInfo,Phone,Picture',
      top: 30,
    });

    if (results.length === 0) {
      throw new NotFoundException();
    }

    return results.map(mapHotelToPlaceCard);
  }, request);
