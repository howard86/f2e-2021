import { BikeService } from '@f2e/tdx-bike';
import { BusService } from '@f2e/tdx-bus';
import { resolveTdxCredentials, TdxService } from '@f2e/tdx-core';
import { RailService } from '@f2e/tdx-rail';
import { TourismService } from '@f2e/tdx-tourism';

// TDX allows 5 requests a minute per key. A build can wait out the window,
// but a page request has to finish inside its serverless timeout, so at
// request time a rate-limited call fails fast and the page degrades instead.
const REQUEST_RATE_LIMIT_WAIT_MS = 5000;
// A build sends dozens of requests (prerendered city pages), so it paces
// them just under the limit rather than letting them race for each window.
const BUILD_REQUEST_INTERVAL_MS = 12_500;
const isBuild = process.env.NEXT_PHASE === 'phase-production-build';

const service = new TdxService(
  resolveTdxCredentials(process.env),
  isBuild
    ? { minRequestIntervalMs: BUILD_REQUEST_INTERVAL_MS }
    : { maxRateLimitWaitMs: REQUEST_RATE_LIMIT_WAIT_MS },
);

export const tourismService = new TourismService(service);

// One TdxService (one token, one rate-limit pacer) behind every client.
export const busService = new BusService(service);

export const bikeService = new BikeService(service);

export const railService = new RailService(service);
