import {
  type ApiParam,
  type City,
  type NearByApiParam,
  type TdxService,
  toODataQuery,
} from '@f2e/tdx-core';
import type {
  PtxServiceDtoBikeSpecificationV2BikeAvailability,
  PtxServiceDtoBikeSpecificationV2BikeStation,
} from './generated/bike-advanced-v2';
import {
  bikeApiAvailabilityAllCityNearBy2871,
  bikeApiStationAllCityNearBy2870,
} from './generated/bike-advanced-v2';
import {
  createClient as createAdvancedClient,
  createConfig as createAdvancedConfig,
} from './generated/bike-advanced-v2/client';
import type { PtxServiceDtoBikeSpecificationV2BikeShape } from './generated/bike-basic-v2';
import {
  bikeApiStation2180,
  cyclingApiShape2182,
} from './generated/bike-basic-v2';
import {
  createClient as createBasicClient,
  createConfig as createBasicConfig,
} from './generated/bike-basic-v2/client';

export type BikeStation = PtxServiceDtoBikeSpecificationV2BikeStation;

export type BikeAvailability = PtxServiceDtoBikeSpecificationV2BikeAvailability;

export type CyclingShape = PtxServiceDtoBikeSpecificationV2BikeShape;

export class BikeService {
  private readonly basic: ReturnType<typeof createBasicClient>;

  private readonly advanced: ReturnType<typeof createAdvancedClient>;

  constructor(service: TdxService) {
    this.basic = service.createClient('basic', (o) =>
      createBasicClient(createBasicConfig(o)),
    );
    this.advanced = service.createClient('advanced', (o) =>
      createAdvancedClient(createAdvancedConfig(o)),
    );
  }

  async getNearByBikeStations(param: NearByApiParam) {
    const { data } = await bikeApiStationAllCityNearBy2870({
      client: this.advanced,
      query: { ...toODataQuery(param), $spatialFilter: param.spatialFilter },
      throwOnError: true,
    });

    return data as BikeStation[];
  }

  async getNearByBikesAvailability(param: NearByApiParam) {
    const { data } = await bikeApiAvailabilityAllCityNearBy2871({
      client: this.advanced,
      query: { ...toODataQuery(param), $spatialFilter: param.spatialFilter },
      throwOnError: true,
    });

    return data as BikeAvailability[];
  }

  async getCyclingShapeByCity(city: City, param: ApiParam) {
    const { data } = await cyclingApiShape2182({
      client: this.basic,
      path: { City: city as never },
      query: toODataQuery(param),
      throwOnError: true,
    });

    return data as CyclingShape[];
  }

  async getBikeStationsByCity(city: City, param: ApiParam = {}) {
    const { data } = await bikeApiStation2180({
      client: this.basic,
      path: { City: city as never },
      query: toODataQuery(param),
      throwOnError: true,
    });

    return data as BikeStation[];
  }
}
