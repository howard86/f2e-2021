import {
  type ApiParam,
  type NearByApiParam,
  type TdxService,
  toODataQuery,
} from './base';
import type { City } from './constants';
import type { PtxServiceDtoBusSpecificationV2BusStation } from './generated/bus-advanced-v2';
import { busApiStationNearBy2851 } from './generated/bus-advanced-v2';
import type {
  PtxServiceDtoBusSpecificationV2BusDisplayStopOfRoute,
  PtxServiceDtoBusSpecificationV2BusN1EstimateTime,
  PtxServiceDtoBusSpecificationV2BusRoute,
  PtxServiceDtoBusSpecificationV2BusShape,
} from './generated/bus-basic-v2';
import {
  cityBusApiDisplayStopOfRoute20381,
  cityBusApiEstimatedTimeOfArrival20321,
  cityBusApiRoute2035,
  cityBusApiRoute20351,
  cityBusApiShape20421,
} from './generated/bus-basic-v2';

export type BusRoute = PtxServiceDtoBusSpecificationV2BusRoute;

export type BusEstimation = PtxServiceDtoBusSpecificationV2BusN1EstimateTime;

// The spec types Direction as a plain number; narrow it to the known values.
export type BusStopOfRoute = Omit<
  PtxServiceDtoBusSpecificationV2BusDisplayStopOfRoute,
  'Direction'
> & { Direction: BusDirection };

export type BusStation = PtxServiceDtoBusSpecificationV2BusStation;

export type BusShape = PtxServiceDtoBusSpecificationV2BusShape;

export const BusDirection = {
  去程: 0,
  未知: 255,
  返程: 1,
  迴圈: 2,
} as const;

export type BusDirection = (typeof BusDirection)[keyof typeof BusDirection];

export const BusStopStatus = {
  交管不停靠: 2,
  今日未營運: 4,
  尚未發車: 1,
  末班車已過: 3,
  正常: 0,
} as const;

export type BusStopStatus = (typeof BusStopStatus)[keyof typeof BusStopStatus];

const withRouteFilter = (routeName: string, params?: ApiParam): ApiParam => ({
  filter: `RouteName/Zh_tw eq '${routeName}'`,
  ...params,
});

export class BusService {
  private readonly service: TdxService;

  constructor(service: TdxService) {
    this.service = service;
  }

  async getBusRoutesByCity(
    city: City,
    params: ApiParam = this.service.DEFAULT_API_PARAMS,
  ) {
    const { data } = await cityBusApiRoute2035({
      client: this.service.basic,
      path: { City: city as never },
      query: toODataQuery(params),
      throwOnError: true,
    });

    return data as BusRoute[];
  }

  async getBusStationNearBy(params: NearByApiParam) {
    const { data } = await busApiStationNearBy2851({
      client: this.service.advanced,
      query: {
        ...toODataQuery(params),
        $spatialFilter: params.spatialFilter,
      },
      throwOnError: true,
    });

    return data as BusStation[];
  }

  async getBusShapesByCityAndRouteName(
    city: City,
    routeName: string,
    params?: ApiParam,
  ) {
    const { data } = await cityBusApiShape20421({
      client: this.service.basic,
      path: { City: city as never, RouteName: routeName },
      query: toODataQuery(withRouteFilter(routeName, params)),
      throwOnError: true,
    });

    return data as BusShape[];
  }

  async getBusRoutesByCityAndRouteName(
    city: City,
    routeName: string,
    params?: ApiParam,
  ) {
    const { data } = await cityBusApiRoute20351({
      client: this.service.basic,
      path: { City: city as never, RouteName: routeName },
      query: toODataQuery(withRouteFilter(routeName, params)),
      throwOnError: true,
    });

    return data as BusRoute[];
  }

  async getBusEstimationsByCityAndRouteName(
    city: City,
    routeName: string,
    params?: ApiParam,
  ) {
    const { data } = await cityBusApiEstimatedTimeOfArrival20321({
      client: this.service.basic,
      path: { City: city as never, RouteName: routeName },
      query: toODataQuery(withRouteFilter(routeName, params)),
      throwOnError: true,
    });

    return data as BusEstimation[];
  }

  async getBusStopOfRoutesByCityAndRouteName(
    city: City,
    routeName: string,
    params?: ApiParam,
  ) {
    const { data } = await cityBusApiDisplayStopOfRoute20381({
      client: this.service.basic,
      path: { City: city as never, RouteName: routeName },
      query: toODataQuery(withRouteFilter(routeName, params)),
      throwOnError: true,
    });

    return data as BusStopOfRoute[];
  }
}
