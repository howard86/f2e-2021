import type { City } from '@f2e/tdx-core';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import type {
  BikeCyclingWithGeoJson,
  NormalisedBikeStation,
  StationQueryParam,
  SuccessApiResponse,
} from '@/types/api';

const ONE_HOUR = 60 * 60;

export const localApi = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
  }),
  endpoints: (builder) => ({
    getCyclingByCity: builder.query<
      SuccessApiResponse<BikeCyclingWithGeoJson[]>,
      City
    >({
      query: (city) => `cyclings?city=${city}`,
    }),
    getStationsByCoordinate: builder.query<
      SuccessApiResponse<NormalisedBikeStation>,
      Record<keyof StationQueryParam, number>
    >({
      query: ({ lat, lng, r }) => `stations?lat=${lat}&lng=${lng}&r=${r}`,
    }),
  }),
  keepUnusedDataFor: ONE_HOUR,
  reducerPath: 'local',
});

export const { useGetCyclingByCityQuery, useLazyGetStationsByCoordinateQuery } =
  localApi;
