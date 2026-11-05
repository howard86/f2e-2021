export type TdxServer = 'basic' | 'advanced' | 'tourism';

export interface NearByApiParam extends ApiParam {
  spatialFilter: string;
}

export interface ApiParam {
  filter?: string;
  orderBy?: string;
  select?: string;
  skip?: string | number;
  top?: string | number;
}

export interface TdxServiceParams {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
}

const getRequiredParam = (
  params: Partial<TdxServiceParams>,
  key: keyof TdxServiceParams,
) => {
  const value = params[key];

  if (!value) {
    throw new Error(`Missing env ${key}`);
  }

  return value;
};

export const toODataQuery = (params: ApiParam) => ({
  $filter: params.filter || undefined,
  $format: 'JSON' as const,
  $orderby: params.orderBy || undefined,
  $select: params.select || undefined,
  // TDX types $skip as a string in most operations.
  $skip: params.skip ? String(params.skip) : undefined,
  $top: params.top ? Number(params.top) : undefined,
});

// TDX allows 5 requests per minute per key and reports the seconds left in
// the window in `ratelimit-reset`. A scene build makes more calls than that,
// so a request may need to wait out more than one window.
const MAX_RATE_LIMIT_RETRIES = 6;
const MAX_RATE_LIMIT_DELAY_MS = 65_000;

const getRetryDelay = (response: Response, attempt: number) => {
  const header =
    response.headers.get('ratelimit-reset') ??
    response.headers.get('retry-after');
  const seconds = header === null ? Number.NaN : Number(header);
  const base = Number.isFinite(seconds)
    ? (seconds + 1) * 1000
    : 2 ** attempt * 1000;
  // Jitter spreads parallel requests across the next window.
  return Math.min(base + Math.random() * 1000, MAX_RATE_LIMIT_DELAY_MS);
};

/** Spaces calls at least `intervalMs` apart, in call order. */
const createThrottle = (intervalMs: number) => {
  let nextAt = 0;

  return async () => {
    const now = Date.now();
    const at = Math.max(now, nextAt);
    nextAt = at + intervalMs;

    if (at > now) {
      await new Promise((resolve) => setTimeout(resolve, at - now));
    }
  };
};

/**
 * Retries 429s by waiting out TDX's window. `maxWaitMs` caps the total time
 * spent waiting: a build can afford to wait minutes, a page request cannot
 * outlast its serverless timeout, so it gives up and surfaces the 429.
 * `minIntervalMs` spaces every request (retries included) so a caller that
 * sends many can stay under the limit instead of racing for each window.
 */
const createRateLimitedFetch = (
  maxWaitMs = Number.POSITIVE_INFINITY,
  minIntervalMs = 0,
) => {
  const throttle = createThrottle(minIntervalMs);
  const send = async (...args: Parameters<typeof fetch>) => {
    await throttle();
    return fetch(...args);
  };

  return async (...args: Parameters<typeof fetch>) => {
    let response = await send(...args);
    let waited = 0;

    for (
      let attempt = 1;
      response.status === 429 && attempt <= MAX_RATE_LIMIT_RETRIES;
      attempt += 1
    ) {
      const delay = getRetryDelay(response, attempt);

      if (waited + delay > maxWaitMs) {
        break;
      }
      waited += delay;

      // biome-ignore lint/performance/noAwaitInLoops: rate-limit retries must remain sequential.
      await new Promise((resolve) => setTimeout(resolve, delay));
      response = await send(...args);
    }

    return response;
  };
};

export interface TdxServiceOptions {
  /** Total time to spend waiting out 429s per request; unlimited by default. */
  maxRateLimitWaitMs?: number;
  /** Minimum gap between TDX requests from this service; none by default. */
  minRequestIntervalMs?: number;
}

export interface TdxClientOptions {
  auth: () => Promise<string>;
  baseUrl: string;
  fetch: typeof fetch;
}

/** Structural shape of a Hey API client-fetch client, so core needs no generated code. */
export interface TdxInterceptableClient {
  interceptors: {
    response: {
      use: (
        fn: (
          response: Response,
          request: Request,
        ) => Response | Promise<Response>,
      ) => unknown;
    };
  };
}

export class TdxService {
  private readonly clientId: string;

  private readonly clientSecret: string;

  private readonly baseUrl: string;

  private accessToken: string | undefined;

  private expirationTimestamp: number | undefined;

  private refreshPromise: Promise<void> | undefined;

  private readonly rateLimitedFetch: ReturnType<typeof createRateLimitedFetch>;

  DEFAULT_API_PARAMS: ApiParam = { top: 20 };

  constructor(
    params: Partial<TdxServiceParams>,
    options: TdxServiceOptions = {},
  ) {
    this.rateLimitedFetch = createRateLimitedFetch(
      options.maxRateLimitWaitMs,
      options.minRequestIntervalMs,
    );
    this.clientId = getRequiredParam(params, 'clientId');
    this.clientSecret = getRequiredParam(params, 'clientSecret');
    this.baseUrl = getRequiredParam(params, 'baseUrl');
  }

  static checkExistence<T>(items: T[]): T | null {
    return items.length > 0 ? items[0] : null;
  }

  private async getAccessToken() {
    if (
      !(this.accessToken && this.expirationTimestamp) ||
      this.expirationTimestamp <= Date.now()
    ) {
      this.refreshPromise ??= this.refreshToken();
      const { refreshPromise } = this;
      try {
        await refreshPromise;
      } finally {
        if (this.refreshPromise === refreshPromise) {
          this.refreshPromise = undefined;
        }
      }
    }

    if (!this.accessToken) {
      throw new Error('Already refreshed existed token');
    }

    return this.accessToken;
  }

  clientOptions(server: TdxServer): TdxClientOptions {
    return {
      auth: () => this.getAccessToken(),
      baseUrl: `${this.baseUrl}/api/${server}`,
      // Bun's `typeof fetch` adds `preconnect`, which a wrapper never has;
      // the call signature is what the generated clients use.
      fetch: this.rateLimitedFetch as typeof fetch,
    };
  }

  createClient<C extends TdxInterceptableClient>(
    server: TdxServer,
    create: (options: TdxClientOptions) => C,
  ): C {
    const client = create(this.clientOptions(server));

    client.interceptors.response.use(async (response, request) => {
      if (!response.ok) {
        const body = await response.text();
        const path = new URL(request.url).pathname.slice('/api'.length);

        throw new Error(
          `TDX ${response.status} ${path}: ${body.slice(0, 200)}`,
        );
      }

      return response;
    });

    return client;
  }

  private async refreshToken() {
    const response = await fetch(
      `${this.baseUrl}/auth/realms/TDXConnect/protocol/openid-connect/token`,
      {
        body: new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: 'client_credentials',
        }),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        method: 'POST',
      },
    );

    if (!response.ok) {
      throw new Error(JSON.stringify(response));
    }

    const json = (await response.json()) as {
      access_token: string;
      expires_in: number;
      token_type: string;
    };

    this.accessToken = json.access_token;
    this.expirationTimestamp = Date.now() + json.expires_in * 1000;
  }
}
