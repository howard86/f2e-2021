import { type CacheStore, getDefaultStore } from './store';

export type { CacheEntry, CacheStore } from './store';

export const MINUTE = 60 * 1000;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;

export interface CachePolicy {
  /** Serve from the browser cache without any request while younger than this (ms). */
  freshFor: number;
  /** Serve as a stale fallback, refetching in the background, until this old (ms). */
  maxAge: number;
}

export interface CachedOptions {
  /** Skip the fresh window and go to the network; the cache stays a fallback. */
  force?: boolean;
  now?: () => number;
  /** Passed to the foreground load only; background refreshes outlive the caller. */
  signal?: AbortSignal;
  store?: CacheStore;
}

const refreshing = new Map<string, Promise<unknown>>();

const read = async <T>(store: CacheStore, key: string, now: number) => {
  try {
    const entry = await store.get<T>(key);
    return entry && entry.expiresAt > now ? entry : undefined;
  } catch {
    // An unreadable store behaves as a miss.
  }
};

const loadAndStore = async <T>(
  store: CacheStore,
  key: string,
  load: (signal?: AbortSignal) => Promise<T>,
  policy: CachePolicy,
  now: () => number,
  signal?: AbortSignal,
) => {
  const value = await load(signal);
  const storedAt = now();

  try {
    await store.set(key, {
      expiresAt: storedAt + policy.maxAge,
      storedAt,
      value,
    });
  } catch {
    // Quota or private-mode failures only cost the cache, not the response.
  }

  return value;
};

/**
 * Stale-while-revalidate over browser storage. A fresh entry is returned with
 * no request; a stale one is returned at once while a background refetch
 * repopulates the store; a miss (or `force`) goes to the network and falls back
 * to whatever is stored if that request fails. `load` must throw on responses
 * that shouldn't be cached.
 */
export const cached = async <T>(
  key: string,
  load: (signal?: AbortSignal) => Promise<T>,
  policy: CachePolicy,
  options: CachedOptions = {},
): Promise<T> => {
  const { force = false, now = Date.now, signal } = options;
  const store = options.store ?? getDefaultStore();

  if (!store) {
    return load(signal);
  }

  const entry = await read<T>(store, key, now());

  if (entry && !force) {
    if (now() - entry.storedAt >= policy.freshFor && !refreshing.has(key)) {
      const refresh = loadAndStore(store, key, load, policy, now)
        .catch(() => undefined)
        .finally(() => refreshing.delete(key));
      refreshing.set(key, refresh);
    }

    return entry.value;
  }

  try {
    return await loadAndStore(store, key, load, policy, now, signal);
  } catch (error) {
    if (entry && !signal?.aborted) {
      return entry.value;
    }
    throw error;
  }
};

/** Resolves once every background refresh started so far has settled. */
export const settleRefreshes = () =>
  Promise.all([...refreshing.values()]).then(() => undefined);
