import {
  type ApiParam,
  type City,
  CitySet,
  constructScenesSearch,
  type ScenicSpot,
} from '@f2e/tdx';

import {
  BadRequestException,
  getSingleParam,
  handleGet,
  NotFoundException,
} from '@/lib/api';
import { mapScenicSpotToSceneCard, tourismService } from '@/services/tdx';

export const dynamic = 'force-dynamic';

export const GET = (request: Request) =>
  handleGet(async (searchParams) => {
    const keyword = getSingleParam(searchParams, 'keyword');
    const city = getSingleParam(searchParams, 'city');

    if (keyword === undefined) {
      throw new BadRequestException();
    }

    let results: ScenicSpot[];

    const apiParam: ApiParam = {
      filter: `Picture/PictureUrl1 ne null and (${constructScenesSearch(
        keyword,
      )})`,
      orderBy: 'SrcUpdateTime desc, Remarks desc',
      select: 'ScenicSpotID,ScenicSpotName,City,Picture',
      top: 30,
    };

    if (city === undefined) {
      results = await tourismService.getScenicSpots(apiParam);
    } else {
      if (!CitySet.has(city as City)) {
        throw new NotFoundException();
      }

      results = await tourismService.getScenicSpotsByCity(
        city as City,
        apiParam,
      );
    }

    if (results.length === 0) {
      throw new NotFoundException();
    }

    return results.map(mapScenicSpotToSceneCard);
  }, request);
