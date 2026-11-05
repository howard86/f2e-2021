'use client';

// Saved places live in localStorage under `scene:saved`.
import { useCallback, useMemo, useSyncExternalStore } from 'react';

import type { PlaceSummary } from '@/types/place';

export interface SavedPlaces {
  isSaved: (href: string) => boolean;
  items: PlaceSummary[];
  /** False until localStorage has been read on the client. */
  ready: boolean;
  toggle: (place: PlaceSummary) => void;
}

const STORAGE_KEY = 'scene:saved';
const MAX_SAVED = 100;
const EMPTY: PlaceSummary[] = [];

let current: PlaceSummary[] | undefined;
const listeners = new Set<() => void>();

const read = (): PlaceSummary[] => {
  try {
    const parsed: unknown = JSON.parse(
      window.localStorage.getItem(STORAGE_KEY) ?? '[]',
    );

    return Array.isArray(parsed)
      ? parsed.filter(
          (item): item is PlaceSummary =>
            typeof item === 'object' &&
            item !== null &&
            typeof item.href === 'string',
        )
      : EMPTY;
  } catch {
    return EMPTY;
  }
};

const emit = () => {
  for (const listener of listeners) {
    listener();
  }
};

const getSnapshot = () => {
  current ??= read();

  return current;
};

const getServerSnapshot = () => EMPTY;

const subscribe = (listener: () => void) => {
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) {
      current = read();
      emit();
    }
  };

  listeners.add(listener);
  window.addEventListener('storage', onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
};

const write = (items: PlaceSummary[]) => {
  current = items;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage full or blocked: keep the in-memory list for this session.
  }
  emit();
};

const subscribeNoop = () => () => undefined;

const useSaved = (): SavedPlaces => {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const ready = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );

  const hrefs = useMemo(() => new Set(items.map((item) => item.href)), [items]);
  const isSaved = useCallback((href: string) => hrefs.has(href), [hrefs]);
  const toggle = useCallback((place: PlaceSummary) => {
    const list = getSnapshot();

    write(
      list.some((item) => item.href === place.href)
        ? list.filter((item) => item.href !== place.href)
        : [place, ...list].slice(0, MAX_SAVED),
    );
  }, []);

  return { isSaved, items, ready, toggle };
};

export default useSaved;
