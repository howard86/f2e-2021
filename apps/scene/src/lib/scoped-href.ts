import type { City } from '@f2e/tdx-core';

import { ALL_CITIES } from '@/constants/preferences';
import type { PlaceType } from '@/types/place';

import {
  decodeSegments,
  type EventsWhen,
  eventsPath,
  listPath,
} from './list-paths';

const LIST_TYPES: Record<string, PlaceType> = {
  '/hotels': 'hotel',
  '/restaurants': 'restaurant',
  '/scenes': 'scene',
};

const WHEN_VALUES: readonly string[] = ['ongoing', 'upcoming', 'free'];

const isWhen = (value: string | undefined): value is EventsWhen =>
  value !== undefined && WHEN_VALUES.includes(value);

const toParams = (search: string | URLSearchParams) =>
  new URLSearchParams(search);

const searchHref = (params: URLSearchParams) => {
  const text = params.toString();

  return text ? `/search?${text}` : '/search';
};

/**
 * Where the browser should go so a list that names no city shows the
 * preferred one; undefined when the URL already names a city (or `all`) or
 * is not a city-scoped list. Pure: the caller does the navigation.
 */
export const scopedHref = (
  pathname: string,
  search: string | URLSearchParams,
  city: City,
): string | undefined => {
  const type = LIST_TYPES[pathname];

  if (type) {
    return listPath({ city, type });
  }

  if (pathname === '/events') {
    return eventsPath({ city });
  }

  const [, root, when, ...rest] = pathname.split('/');

  if (root === 'events' && rest.length === 0 && isWhen(when)) {
    return eventsPath({ city, when });
  }

  if (pathname === '/search') {
    const params = toParams(search);

    if (params.has('city')) {
      return;
    }

    params.set('city', city);

    return searchHref(params);
  }
};

const rescopedList = (
  type: PlaceType,
  parts: string[],
  city: City | undefined,
) => {
  // parts: [city?, tag?, 'page', n]; a tag is whatever precedes 'page'.
  const [current, second] = parts;

  if (current === undefined) {
    return city ? listPath({ city, type }) : undefined;
  }

  const tag = second === undefined || second === 'page' ? undefined : second;

  return listPath({ city: city ?? (tag ? ALL_CITIES : undefined), tag, type });
};

const rescopedEvents = (parts: string[], city: City | undefined) => {
  const [first] = parts;

  if (isWhen(first)) {
    return eventsPath({ city, when: first });
  }

  return first === undefined && city ? eventsPath({ city }) : undefined;
};

const rescopedSearch = (
  search: string | URLSearchParams,
  city: City | undefined,
) => {
  const params = toParams(search);

  if (city) {
    params.set('city', city);
  } else {
    params.delete('city');
  }

  return searchHref(params);
};

/**
 * The current list re-scoped after the preferred city changed: swaps the city
 * segment (dropping the page) or removes it when `city` is undefined. Returns
 * undefined for pages the preference does not scope or when nothing changes.
 */
export const rescopedHref = (
  pathname: string,
  search: string | URLSearchParams,
  city: City | undefined,
): string | undefined => {
  const [, root, ...rest] = pathname.split('/');
  const parts = decodeSegments(rest) ?? [];
  const type = LIST_TYPES[`/${root}`];
  let target: string | undefined;

  if (type) {
    target = rescopedList(type, parts, city);
  } else if (root === 'events') {
    target = rescopedEvents(parts, city);
  } else if (pathname === '/search') {
    target = rescopedSearch(search, city);
  }

  const current = toParams(search).toString();
  const currentHref = current ? `${pathname}?${current}` : pathname;

  return target === currentHref ? undefined : target;
};
