import { TdxService } from '@f2e/tdx-core';
import { TourismService } from '@f2e/tdx-tourism';

// TDX allows 5 requests a minute per key. A build can wait out the window,
// but a page request has to finish inside its serverless timeout, so at
// request time a rate-limited call fails fast and the page degrades instead.
const REQUEST_RATE_LIMIT_WAIT_MS = 5000;
const isBuild = process.env.NEXT_PHASE === 'phase-production-build';

const service = new TdxService(
  {
    baseUrl: process.env.TDX_BASE_URL,
    clientId: process.env.TDX_CLIENT_ID,
    clientSecret: process.env.TDX_CLIENT_SECRET,
  },
  { maxRateLimitWaitMs: isBuild ? undefined : REQUEST_RATE_LIMIT_WAIT_MS },
);

export const tourismService = new TourismService(service);
