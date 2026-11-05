import { type City, CitySet } from '@f2e/tdx-core';

/** The preferred city is kept in the browser only, under this localStorage key. */
export const PREFERRED_CITY_KEY = 'scene:preferred-city';

/** `?city=all` shows every city even when a preference is set. */
export const ALL_CITIES = 'all';

/** List pages the preference scopes when their URL names no city. */
export const CITY_SCOPED_PATHS = [
  '/scenes',
  '/restaurants',
  '/hotels',
  '/events',
  '/search',
];

export const toPreferredCity = (value: string | null | undefined) =>
  value && CitySet.has(value as City) ? (value as City) : undefined;
