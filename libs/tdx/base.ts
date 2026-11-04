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

  constructor(params: Partial<TdxServiceParams>) {
    this.clientId = getRequiredParam(params, 'clientId');
    this.clientSecret = getRequiredParam(params, 'clientSecret');
    this.baseUrl = getRequiredParam(params, 'baseUrl');
  }

  static checkExistence<T>(items: T[]): T | null {
    return items.length > 0 ? items[0] : null;
  }

  async get<T, P extends ApiParam = ApiParam>(
    path: string,
    params: P,
  ): Promise<T> {
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

    const query = new URLSearchParams();

    for (const key of Object.keys(params)) {
      if (params[key]) {
        query.append(`$${key === 'orderBy' ? 'orderby' : key}`, params[key]);
      }
    }

    query.append('$format', 'JSON');

    const response = await fetchWithRateLimitRetry(
      `${this.baseUrl}/api${encodeURI(path)}?${query.toString()}`,
      {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${this.accessToken}`,
        },
      },
    );

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`TDX ${response.status} ${path}: ${body.slice(0, 200)}`);
    }

    return response.json();
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
