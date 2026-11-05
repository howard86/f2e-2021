import { type City, CitySet } from '@f2e/tdx-core';

import { MAX_PAGE } from '@/constants/pagination';
import { ALL_CITIES } from '@/constants/preferences';
import { PLACE_LIST_HREF, type PlaceType } from '@/types/place';

/**
 * Canonical, cacheable list URLs. Every filter lives in the path and page 1 is
 * never written:
 *   /scenes[/<city|all>[/<tag>]][/page/<n>]
 *   /events[/<when>[/<city|all>[/page/<n>]]]
 */

export type PathCity = City | typeof ALL_CITIES;

export type EventsWhen = 'free' | 'ongoing' | 'upcoming';

const EVENTS_WHEN: readonly EventsWhen[] = ['ongoing', 'upcoming', 'free'];

const PAGE_SEGMENT = 'page';
const PAGE_PATTERN = /^\d{1,4}$/u;

export interface ListPathParams {
  city?: PathCity;
  page: number;
  /** Only values from getTagOptions(type) are accepted when parsing. */
  tag?: string;
}

export interface EventsPathParams {
  city?: PathCity;
  page: number;
  when: EventsWhen;
}

const pageSegments = (page: number | undefined) =>
  page !== undefined && page > 1 ? [PAGE_SEGMENT, String(page)] : [];

export const listPath = ({
  city,
  page,
  tag,
  type,
}: {
  city?: PathCity;
  page?: number;
  tag?: string;
  type: PlaceType;
}) => {
  if (type === 'activity') {
    return eventsPath({ city, page });
  }

  const paging = pageSegments(page);
  const segments =
    city || tag || paging.length > 0
      ? [
          city ?? ALL_CITIES,
          ...(tag ? [encodeURIComponent(tag)] : []),
          ...paging,
        ]
      : [];

  return [PLACE_LIST_HREF[type], ...segments].join('/');
};

export const eventsPath = ({
  city,
  page,
  when,
}: {
  city?: PathCity;
  page?: number;
  when?: EventsWhen;
}) => {
  const paging = pageSegments(page);

  if (!(city || paging.length > 0)) {
    return when && when !== 'ongoing'
      ? `${PLACE_LIST_HREF.activity}/${when}`
      : PLACE_LIST_HREF.activity;
  }

  return [
    PLACE_LIST_HREF.activity,
    when ?? 'ongoing',
    city ?? ALL_CITIES,
    ...paging,
  ].join('/');
};

const parseCity = (value: string): PathCity | undefined => {
  if (value === ALL_CITIES) {
    return ALL_CITIES;
  }

  return CitySet.has(value as City) ? (value as City) : undefined;
};

const parsePageNumber = (value: string) => {
  if (!PAGE_PATTERN.test(value)) {
    return;
  }

  const page = Number(value);

  return page >= 2 && page <= MAX_PAGE ? page : undefined;
};

/** Parses `[[...filters]]` of a list route; null means 404. */
export const parseListPath = (
  segments: string[] | undefined,
  tagValues: string[],
): ListPathParams | null => {
  const parts = segments ?? [];

  if (parts.length === 0) {
    return { page: 1 };
  }

  const city = parseCity(parts[0]);

  if (!city) {
    return null;
  }

  let tag: string | undefined;
  let rest = parts.slice(1);
  const [head] = rest;

  if (head !== undefined && head !== PAGE_SEGMENT) {
    tag = head;
    rest = rest.slice(1);

    if (!tagValues.includes(tag)) {
      return null;
    }
  }

  if (rest.length === 0) {
    return { city, page: 1, tag };
  }

  const page =
    rest.length === 2 && rest[0] === PAGE_SEGMENT
      ? parsePageNumber(rest[1])
      : undefined;

  return page ? { city, page, tag } : null;
};

/** Parses `[[...filters]]` of the events route; null means 404. */
export const parseEventsPath = (
  segments: string[] | undefined,
): EventsPathParams | null => {
  const parts = segments ?? [];

  if (parts.length === 0) {
    return { page: 1, when: 'ongoing' };
  }

  const when = EVENTS_WHEN.find((value) => value === parts[0]);

  if (!when || parts.length === 3 || parts.length > 4) {
    return null;
  }

  if (parts.length === 1) {
    return { page: 1, when };
  }

  const city = parseCity(parts[1]);

  if (!city) {
    return null;
  }

  if (parts.length === 2) {
    return { city, page: 1, when };
  }

  const page =
    parts[2] === PAGE_SEGMENT ? parsePageNumber(parts[3]) : undefined;

  return page ? { city, page, when } : null;
};

/** Route params may arrive percent-encoded; decode without throwing. */
export const decodeSegments = (segments: string[] | undefined) =>
  segments?.map((segment) => {
    try {
      return decodeURIComponent(segment);
    } catch {
      return segment;
    }
  });
