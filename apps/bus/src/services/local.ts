import { DAY } from '@f2e/browser-cache';
import { withBrowserCache } from '@f2e/browser-cache/rtk';
import type { BusEstimation, BusRoute, BusStation } from '@f2e/tdx-bus';
import type { City } from '@f2e/tdx-core';
import { createEntityAdapter, type EntityState } from '@reduxjs/toolkit';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import type {
  BusEstimationParam,
  StationQueryParam,
  SuccessApiResponse,
} from '@/types/api';

// Coordinates rounded to ~110 m, well inside the 1 km nearby radius, so repeat
// lookups from the same spot share one browser-cache entry.
const roundCoordinate = (value: number) => value.toFixed(3);

const busEstimationAdapter = createEntityAdapter<BusEstimation, string>({
  selectId: (busEstimation) => busEstimation.StopUID,
});

export const localApi = createApi({
  // Route and stop lookups change rarely; live estimations stay uncached.
  baseQuery: withBrowserCache(fetchBaseQuery({ baseUrl: '/api' }), {
    getBusRoutes: { freshFor: DAY, maxAge: 30 * DAY },
    getNearByBus: { freshFor: DAY, maxAge: 30 * DAY },
  }),
  endpoints: (builder) => ({
    getBusEstimation: builder.query<
      EntityState<BusEstimation, string>,
      BusEstimationParam
    >({
      query: (params) => ({
        params,
        url: 'bus/estimation',
      }),
      transformResponse: (res: SuccessApiResponse<BusEstimation[]>) =>
        busEstimationAdapter.addMany(
          busEstimationAdapter.getInitialState(),
          res.data,
        ),
    }),
    getBusRoutes: builder.query<
      SuccessApiResponse<BusRoute[]>,
      { city: City; route: string }
    >({
      query: ({ city, route }) => ({
        params: { city, route },
        url: 'bus/route',
      }),
    }),
    getNearByBus: builder.mutation<
      SuccessApiResponse<BusStation[]>,
      Record<keyof StationQueryParam, number>
    >({
      query: ({ lat, lng }) =>
        `bus/nearby?lat=${roundCoordinate(lat)}&lng=${roundCoordinate(lng)}`,
    }),
  }),
  reducerPath: 'local',
});

export const busEstimationSelector = busEstimationAdapter.getSelectors();

export const {
  useGetBusEstimationQuery,
  useGetNearByBusMutation,
  useLazyGetBusRoutesQuery,
} = localApi;
