import {
  type ApiParam,
  type NearByApiParam,
  type TdxService,
  toODataQuery,
} from './base';
import type { City } from './constants';
import type {
  PtxServiceDtoBikeSpecificationV2BikeAvailability,
  PtxServiceDtoBikeSpecificationV2BikeStation,
} from './generated/bike-advanced-v2';
import {
  bikeApiAvailabilityAllCityNearBy2871,
  bikeApiStationAllCityNearBy2870,
} from './generated/bike-advanced-v2';
import type { PtxServiceDtoBikeSpecificationV2BikeShape } from './generated/bike-basic-v2';
import { cyclingApiShape2182 } from './generated/bike-basic-v2';

export type BikeStation = PtxServiceDtoBikeSpecificationV2BikeStation;

export type BikeAvailability = PtxServiceDtoBikeSpecificationV2BikeAvailability;

export type CyclingShape = PtxServiceDtoBikeSpecificationV2BikeShape;

export class BikeService {
  private readonly service: TdxService;

  constructor(service: TdxService) {
    this.service = service;
  }

  async getNearByBikeStations(param: NearByApiParam) {
    const { data } = await bikeApiStationAllCityNearBy2870({
      client: this.service.advanced,
      query: { ...toODataQuery(param), $spatialFilter: param.spatialFilter },
      throwOnError: true,
    });

    return data as BikeStation[];
  }

  async getNearByBikesAvailability(param: NearByApiParam) {
    const { data } = await bikeApiAvailabilityAllCityNearBy2871({
      client: this.service.advanced,
      query: { ...toODataQuery(param), $spatialFilter: param.spatialFilter },
      throwOnError: true,
    });

    return data as BikeAvailability[];
  }

  async getCyclingShapeByCity(city: City, param: ApiParam) {
    const { data } = await cyclingApiShape2182({
      client: this.service.basic,
      path: { City: city as never },
      query: toODataQuery(param),
      throwOnError: true,
    });

    return data as CyclingShape[];
  }
}
