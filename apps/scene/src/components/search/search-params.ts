import { type City, CitySet } from '@f2e/tdx-core';

import { MAX_PAGE } from '@/constants/pagination';
import { ALL_CITIES } from '@/constants/preferences';
import type { ActivityWhen } from '@/types/place';

export type RawSearchParams = Record<string, string | string[] | undefined>;

export interface ListParams {
  /** `?city=all`: every city, overriding the browser's preferred city. */
  allCities?: boolean;
  city?: City;
  free?: boolean;
  page: number;
  q?: string;
  tag?: string;
  when?: ActivityWhen;
}

const MAX_KEYWORD_LENGTH = 50;

const PAGE_PATTERN = /^\d{1,4}$/u;

const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export const parseKeyword = (value: string | string[] | undefined) => {
  const keyword = first(value)?.trim().slice(0, MAX_KEYWORD_LENGTH);

  return keyword ? keyword : undefined;
};

export const parsePage = (value: string | string[] | undefined) => {
  const raw = first(value);

  if (!(raw && PAGE_PATTERN.test(raw))) {
    return 1;
  }

  const page = Number(raw);

  return page >= 1 && page <= MAX_PAGE ? page : 1;
};

const parseCity = (value: string | string[] | undefined) => {
  const city = first(value);

  return city && CitySet.has(city as City) ? (city as City) : undefined;
};

/**
 * Normalises raw page searchParams: unknown cities, tags outside `tagValues`,
 * bad page numbers and blank keywords are dropped.
 */
export const parseListParams = (
  raw: RawSearchParams,
  tagValues: string[] = [],
): ListParams => {
  const tag = first(raw.tag);
  const when = first(raw.when);

  return {
    allCities: first(raw.city) === ALL_CITIES || undefined,
    city: parseCity(raw.city),
    free: first(raw.free) === '1' ? true : undefined,
    page: parsePage(raw.page),
    q: parseKeyword(raw.q),
    tag: tag && tagValues.includes(tag) ? tag : undefined,
    when: when === 'ongoing' || when === 'upcoming' ? when : undefined,
  };
};

/** String form of the params for links; omits `page` and empty values. */
export const toQueryRecord = (
  params: Partial<Omit<ListParams, 'free' | 'page'>> & { free?: boolean },
): Record<string, string | undefined> => ({
  city: params.city ?? (params.allCities ? ALL_CITIES : undefined),
  free: params.free ? '1' : undefined,
  q: params.q,
  tag: params.tag,
  when: params.when,
});

export const buildHref = (
  basePath: string,
  query: Record<string, string | undefined>,
) => {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value) {
      search.set(key, value);
    }
  }

  const text = search.toString();

  return text ? `${basePath}?${text}` : basePath;
};
