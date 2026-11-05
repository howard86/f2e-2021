import type { TdxServiceParams } from './service';

type Env = Record<string, string | undefined>;

/**
 * TDX allows 5 requests a minute per key, so production keeps its key to
 * itself: preview deployments and local dev use TDX_PREVIEW_CLIENT_ID/SECRET
 * when they are set, and fall back to the main key otherwise.
 */
export const resolveTdxCredentials = (env: Env): Partial<TdxServiceParams> => {
  const usePreviewKey =
    env.VERCEL_ENV !== 'production' &&
    Boolean(env.TDX_PREVIEW_CLIENT_ID && env.TDX_PREVIEW_CLIENT_SECRET);

  return {
    baseUrl: env.TDX_BASE_URL,
    clientId: usePreviewKey ? env.TDX_PREVIEW_CLIENT_ID : env.TDX_CLIENT_ID,
    clientSecret: usePreviewKey
      ? env.TDX_PREVIEW_CLIENT_SECRET
      : env.TDX_CLIENT_SECRET,
  };
};

/** `next dev` serves recorded fixtures instead of TDX unless TDX_LIVE is set. */
export const shouldUseTdxFixtures = (env: Env) =>
  env.NODE_ENV === 'development' && !env.TDX_LIVE;
