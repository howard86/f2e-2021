import {
  type Client,
  createClient,
  createConfig,
} from './generated/bus-basic-v2/client';

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

const fetchWithRateLimitRetry = async (...args: Parameters<typeof fetch>) => {
  let response = await fetch(...args);

  for (let attempt = 1; response.status === 429 && attempt <= 2; attempt += 1) {
    const resetSeconds = Number(response.headers.get('ratelimit-reset'));
    const delay =
      Number.isFinite(resetSeconds) && resetSeconds >= 0
        ? Math.min(resetSeconds + 1, 60) * 1000
        : attempt * 1000;

    // biome-ignore lint/performance/noAwaitInLoops: rate-limit retries must remain sequential.
    await new Promise((resolve) => setTimeout(resolve, delay));
    response = await fetch(...args);
  }

  return response;
};

export class TdxService {
  private readonly clientId: string;

  private readonly clientSecret: string;

  private readonly baseUrl: string;

  private accessToken: string | undefined;

  private expirationTimestamp: number | undefined;

  private refreshPromise: Promise<void> | undefined;

  DEFAULT_API_PARAMS: ApiParam = { top: 20 };

  readonly basic: Client;

  readonly advanced: Client;

  readonly tourism: Client;

  constructor(params: Partial<TdxServiceParams>) {
    this.clientId = getRequiredParam(params, 'clientId');
    this.clientSecret = getRequiredParam(params, 'clientSecret');
    this.baseUrl = getRequiredParam(params, 'baseUrl');
    this.basic = this.createClient('basic');
    this.advanced = this.createClient('advanced');
    this.tourism = this.createClient('tourism');
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

  private createClient(server: 'advanced' | 'basic' | 'tourism') {
    const client = createClient(
      createConfig({
        auth: () => this.getAccessToken(),
        baseUrl: `${this.baseUrl}/api/${server}`,
        fetch: fetchWithRateLimitRetry,
      }),
    );

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
