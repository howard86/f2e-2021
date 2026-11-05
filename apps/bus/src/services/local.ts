import { cached, DAY } from '@f2e/browser-cache';
import type { BusEstimation, BusRoute, BusStation } from '@f2e/tdx-bus';
import type { City } from '@f2e/tdx-core';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

import type {
  BusEstimationParam,
  ErrorApiResponse,
  StationQueryParam,
  SuccessApiResponse,
} from '@/types/api';

// Route and stop lookups change rarely; live estimations stay uncached.
const LOOKUP_CACHE_POLICY = { freshFor: DAY, maxAge: 30 * DAY };

// Coordinates rounded to ~110 m, well inside the 1 km nearby radius, so repeat
// lookups from the same spot share one browser-cache entry.
const roundCoordinate = (value: number) => value.toFixed(3);

const getJson = async <T>(url: string, signal?: AbortSignal) => {
  const response = await fetch(url, { signal });
  const body = (await response.json()) as
    | SuccessApiResponse<T>
    | ErrorApiResponse;

  if (!(response.ok && body.success)) {
    throw new Error(`Request failed: ${url}`);
  }

  return body;
};

const getCachedJson = <T>(url: string, signal?: AbortSignal) =>
  cached(
    url,
    (loadSignal) => getJson<T>(url, loadSignal),
    LOOKUP_CACHE_POLICY,
    {
      signal,
    },
  );

export const useGetBusEstimation = (
  { city, route }: BusEstimationParam,
  refreshInterval: number,
) =>
  useSWR(
    `/api/bus/estimation?${new URLSearchParams({ city, route })}`,
    (url) => getJson<BusEstimation[]>(url),
    { refreshInterval },
  );

export const useGetBusRoutes = (params: { city: City; route: string } | null) =>
  useSWR(
    params && `/api/bus/route?${new URLSearchParams(params)}`,
    (url) => getCachedJson<BusRoute[]>(url),
    { keepPreviousData: true },
  );

export const useGetNearByBus = () =>
  useSWRMutation(
    '/api/bus/nearby',
    (url, { arg }: { arg: Record<keyof StationQueryParam, number> }) =>
      getCachedJson<BusStation[]>(
        `${url}?lat=${roundCoordinate(arg.lat)}&lng=${roundCoordinate(arg.lng)}`,
      ),
  );
