'use client';

import type { City } from '@f2e/tdx-core';
import { useCallback, useSyncExternalStore } from 'react';

import { PREFERRED_CITY_KEY, toPreferredCity } from '@/constants/preferences';

const listeners = new Set<() => void>();

const read = () => {
  try {
    return toPreferredCity(window.localStorage.getItem(PREFERRED_CITY_KEY));
  } catch {
    // Storage blocked (e.g. private mode): behave as if nothing is set.
  }
};

const subscribe = (listener: () => void) => {
  const onStorage = (event: StorageEvent) => {
    if (event.key === PREFERRED_CITY_KEY || event.key === null) {
      listener();
    }
  };

  listeners.add(listener);
  window.addEventListener('storage', onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
};

const getServerSnapshot = () => undefined;

const subscribeNoop = () => () => undefined;
const isClient = () => true;
const isServer = () => false;

/** Browser-only preferred city, synced across components and tabs. */
const usePreferredCity = () => {
  const city = useSyncExternalStore(subscribe, read, getServerSnapshot);
  const ready = useSyncExternalStore(subscribeNoop, isClient, isServer);

  const setCity = useCallback((next: City | undefined) => {
    try {
      if (next) {
        window.localStorage.setItem(PREFERRED_CITY_KEY, next);
      } else {
        window.localStorage.removeItem(PREFERRED_CITY_KEY);
      }
    } catch {
      // Storage blocked: the choice still applies to this navigation.
    }
    for (const listener of listeners) {
      listener();
    }
  }, []);

  return { city, ready, setCity };
};

export default usePreferredCity;
