import { type City, CitySet } from '@f2e/tdx-core';

/** The preferred city is kept in the browser only, under this localStorage key. */
export const PREFERRED_CITY_KEY = 'scene:preferred-city';

/** The `all` city segment (or `?city=all`) shows every city despite a preference. */
export const ALL_CITIES = 'all';

export const toPreferredCity = (value: string | null | undefined) =>
  value && CitySet.has(value as City) ? (value as City) : undefined;
