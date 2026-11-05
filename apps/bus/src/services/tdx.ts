import { BusService } from '@f2e/tdx-bus';
import { resolveTdxCredentials, TdxService } from '@f2e/tdx-core';

// TDX allows 5 requests a minute per key. A page request has to finish inside
// its serverless timeout, so a rate-limited call fails fast instead of waiting
// out the window.
const REQUEST_RATE_LIMIT_WAIT_MS = 5000;

const service = new TdxService(resolveTdxCredentials(process.env), {
  maxRateLimitWaitMs: REQUEST_RATE_LIMIT_WAIT_MS,
});

export const busService = new BusService(service);
