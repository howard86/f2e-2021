import type {
  BusEstimation,
  BusRoute,
  BusShape,
  BusStation,
  BusStopOfRoute,
} from '@f2e/tdx-bus';
import { shouldUseTdxFixtures } from '@f2e/tdx-core';

/**
 * `next dev` serves recorded fixtures (Taipei 307 and the stations around
 * Taipei Main Station) instead of calling TDX; set TDX_LIVE=1 to opt out.
 * The JSON is imported lazily so production paths never load it.
 */
export const serveFixtures = () => shouldUseTdxFixtures(process.env);

export const loadFixture = {
  estimation: async () =>
    (await import('@/fixtures/estimation.json')).default as BusEstimation[],
  nearby: async () =>
    (await import('@/fixtures/nearby.json')).default as unknown as BusStation[],
  route: async () =>
    (await import('@/fixtures/route.json')).default as unknown as BusRoute[],
  shape: async () =>
    (await import('@/fixtures/shape.json')).default as unknown as BusShape[],
  stops: async () =>
    (await import('@/fixtures/stops.json'))
      .default as unknown as BusStopOfRoute[],
};
