import { cached, DAY } from '@f2e/browser-cache';
import type { City } from '@f2e/tdx-core';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

import type {
  BikeCyclingWithGeoJson,
  NormalisedBikeStation,
  StationQueryParam,
  SuccessApiResponse,
} from '@/types/api';

// Cycling routes barely change; station availability is live, so uncached.
const CYCLING_CACHE_POLICY = { freshFor: 7 * DAY, maxAge: 30 * DAY };

const getJson = async <T extends { success: boolean }>(
  url: string,
  signal?: AbortSignal,
): Promise<T> => {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  const body = (await response.json()) as T;
  if (!body.success) {
    throw new Error('Request was unsuccessful');
  }
  return body;
};

type StationParams = Record<keyof StationQueryParam, number>;

const getCyclingByCity = (city: City) => {
  const url = `/api/cyclings?city=${city}`;
  return cached(
    url,
    (signal) =>
      getJson<SuccessApiResponse<BikeCyclingWithGeoJson[]>>(url, signal),
    CYCLING_CACHE_POLICY,
  );
};

const getStationsByCoordinate = (
  _key: string,
  { arg: { lat, lng, r } }: { arg: StationParams },
) =>
  getJson<SuccessApiResponse<NormalisedBikeStation>>(
    `/api/stations?lat=${lat}&lng=${lng}&r=${r}`,
  );

export const useGetCyclingByCity = (city: City | undefined, skip: boolean) =>
  useSWR(skip || !city ? null : ['cyclings', city], ([, key]) =>
    getCyclingByCity(key),
  );

export const useGetStationsByCoordinate = () =>
  useSWRMutation('stations', getStationsByCoordinate);
