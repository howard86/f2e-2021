import { type City, CitySet } from '@f2e/tdx-core';

export type RawSearchParams = Record<string, string | string[] | undefined>;

const MAX_KEYWORD_LENGTH = 50;

const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export const parseKeyword = (value: string | string[] | undefined) => {
  const keyword = first(value)?.trim().slice(0, MAX_KEYWORD_LENGTH);

  return keyword ? keyword : undefined;
};

/** A known city slug from `?city=`; `all` and unknown values give undefined. */
export const parseCity = (value: string | string[] | undefined) => {
  const city = first(value);

  return city && CitySet.has(city as City) ? (city as City) : undefined;
};

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
