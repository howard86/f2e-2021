import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  FetchBaseQueryMeta,
} from '@reduxjs/toolkit/query';

import { type CachePolicy, cached } from './index';

type FetchQuery = BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError,
  object,
  FetchBaseQueryMeta
>;

type FailedResult = Awaited<ReturnType<FetchQuery>>;

class FailedQuery extends Error {
  readonly result: FailedResult;

  constructor(result: FailedResult) {
    super('Query failed');
    this.result = result;
  }
}

const toKey = (args: string | FetchArgs) => {
  if (typeof args === 'string') {
    return args;
  }

  const params = Object.entries(args.params ?? {})
    .filter(([, value]) => value !== undefined)
    .map(([name, value]) => [name, String(value)])
    .sort(([a], [b]) => a.localeCompare(b));

  return params.length > 0
    ? `${args.url}?${new URLSearchParams(params).toString()}`
    : args.url;
};

/**
 * Wraps a fetchBaseQuery so the endpoints named in `policies` read through the
 * browser cache. Other endpoints, and non-GET requests, pass straight through.
 * A manual `refetch()` skips the fresh window but still falls back to storage.
 */
export const withBrowserCache =
  (
    baseQuery: FetchQuery,
    policies: Partial<Record<string, CachePolicy>>,
  ): FetchQuery =>
  async (args, api, extraOptions) => {
    const policy = policies[api.endpoint];
    const method = typeof args === 'string' ? 'GET' : (args.method ?? 'GET');

    if (!policy || method.toUpperCase() !== 'GET') {
      return baseQuery(args, api, extraOptions);
    }

    try {
      const data = await cached(
        `${api.endpoint}:${toKey(args)}`,
        async () => {
          const result = await baseQuery(args, api, extraOptions);
          if (result.error) {
            throw new FailedQuery(result);
          }
          return result.data;
        },
        policy,
        { force: api.forced === true },
      );

      return { data };
    } catch (error) {
      if (error instanceof FailedQuery) {
        return error.result;
      }
      throw error;
    }
  };
