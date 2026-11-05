/// <reference types="bun" />

import { describe, expect, mock, test } from 'bun:test';

import {
  type CacheEntry,
  type CacheStore,
  cached,
  settleRefreshes,
} from './index';

const policy = { freshFor: 100, maxAge: 1000 };

const memoryStore = (seed: Record<string, CacheEntry> = {}) => {
  const entries = new Map<string, CacheEntry>(Object.entries(seed));
  const store: CacheStore = {
    get: <T>(key: string) =>
      Promise.resolve(entries.get(key) as CacheEntry<T> | undefined),
    set: (key, value) => {
      entries.set(key, value);
      return Promise.resolve();
    },
  };
  return { entries, store };
};

const fail = (message: string) => (): Promise<string> =>
  Promise.reject(new Error(message));

const entry = (value: unknown, storedAt: number): CacheEntry => ({
  expiresAt: storedAt + policy.maxAge,
  storedAt,
  value,
});

describe('cached', () => {
  test('loads and stores on a miss', async () => {
    const { entries, store } = memoryStore();
    const load = mock(async () => 'network');

    expect(await cached('k', load, policy, { now: () => 0, store })).toBe(
      'network',
    );
    expect(load).toHaveBeenCalledTimes(1);
    expect(entries.get('k')).toEqual(entry('network', 0));
  });

  test('serves a fresh entry without loading', async () => {
    const { store } = memoryStore({ k: entry('cached', 0) });
    const load = mock(async () => 'network');

    expect(await cached('k', load, policy, { now: () => 50, store })).toBe(
      'cached',
    );
    expect(load).not.toHaveBeenCalled();
  });

  test('serves a stale entry and refreshes it in the background', async () => {
    const { entries, store } = memoryStore({ k: entry('cached', 0) });
    const load = mock(async () => 'network');

    expect(await cached('k', load, policy, { now: () => 500, store })).toBe(
      'cached',
    );
    await settleRefreshes();
    expect(load).toHaveBeenCalledTimes(1);
    expect(entries.get('k')).toEqual(entry('network', 500));
  });

  test('keeps the stale entry when the background refresh fails', async () => {
    const { entries, store } = memoryStore({ k: entry('cached', 0) });
    const load = mock(fail('429'));

    expect(await cached('k', load, policy, { now: () => 500, store })).toBe(
      'cached',
    );
    await settleRefreshes();
    expect(entries.get('k')).toEqual(entry('cached', 0));
  });

  test('ignores expired entries', async () => {
    const { store } = memoryStore({ k: entry('cached', 0) });

    expect(
      await cached('k', async () => 'network', policy, {
        now: () => 1000,
        store,
      }),
    ).toBe('network');
  });

  test('force goes to the network but falls back to storage on failure', async () => {
    const { store } = memoryStore({ k: entry('cached', 0) });

    expect(
      await cached('k', async () => 'network', policy, {
        force: true,
        now: () => 10,
        store,
      }),
    ).toBe('network');
    expect(
      await cached('k', fail('offline'), policy, {
        force: true,
        now: () => 20,
        store,
      }),
    ).toBe('network');
  });

  test('rethrows on a miss when the load fails', async () => {
    const { entries, store } = memoryStore();
    const failing = cached('k', fail('500'), policy, { store });

    await expect(failing).rejects.toThrow('500');
    expect(entries.size).toBe(0);
  });

  test('loads directly when no store is available', async () => {
    expect(await cached('k', async () => 'network', policy)).toBe('network');
  });
});
