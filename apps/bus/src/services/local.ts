import type { BusEstimation, BusRoute, BusStation, City } from '@f2e/tdx';
import { createEntityAdapter, type EntityState } from '@reduxjs/toolkit';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import type {
  BusEstimationParam,
  StationQueryParam,
  SuccessApiResponse,
} from '@/types/api';

const busEstimationAdapter = createEntityAdapter<BusEstimation, string>({
  selectId: (busEstimation) => busEstimation.StopUID,
});

export const localApi = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
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
      query: ({ lat, lng }) => `bus/nearby?lat=${lat}&lng=${lng}`,
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
