// Pure helpers behind services/places.ts: input validation, the OData
// parameters for each PlaceQuery, and tag options. Kept free of Next and TDX
// imports so they can run under `bun test`.
import { type City, CitySet } from '@f2e/tdx-core';
import {
  ATTRACTION_CLASSES,
  CUISINE_CLASSES,
  constructKeywordFilter,
  EVENT_CLASSES,
  HOTEL_CLASSES,
  HOTEL_STARS,
  type TourismPropertyType,
  type V2Params,
} from '@f2e/tdx-tourism';

import {
  PLACE_TYPES,
  type PlaceQuery,
  type PlaceType,
  type TagOption,
} from '@/types/place';

export const DEFAULT_PAGE_SIZE = 12;
export const MAX_PAGE_SIZE = 48;
export const MAX_KEYWORD_LENGTH = 60;

export const TOURISM_TYPE: Record<PlaceType, TourismPropertyType> = {
  activity: 'Activity',
  hotel: 'Hotel',
  restaurant: 'Restaurant',
  scene: 'ScenicSpot',
};

const ID_FIELD: Record<PlaceType, string> = {
  activity: 'EventID',
  hotel: 'HotelID',
  restaurant: 'RestaurantID',
  scene: 'AttractionID',
};

const CLASS_FIELD: Record<PlaceType, string> = {
  activity: 'EventClasses',
  hotel: 'HotelClasses',
  restaurant: 'CuisineClasses',
  scene: 'AttractionClasses',
};

const range = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => from + i);

// Top-level event classes (1 節慶, 2 藝文) also match their 1xx / 2xx
// sub-types, which is where most records are filed.
const SUB_CODES: Partial<Record<PlaceType, Record<string, number[]>>> = {
  activity: { 1: range(101, 110), 2: range(201, 215) },
};

const VALID_ID = /^[\w.:-]{1,120}$/u;
const STAR_TAG = /^star:(?<stars>[0-6])$/u;
const CODE_TAG = /^\d{1,3}$/u;

export const isPlaceType = (value: unknown): value is PlaceType =>
  typeof value === 'string' && PLACE_TYPES.includes(value as PlaceType);

export const isCity = (value: unknown): value is City =>
  typeof value === 'string' && CitySet.has(value as City);

export const isValidId = (value: unknown): value is string =>
  typeof value === 'string' && VALID_ID.test(value);

/** Trimmed keyword capped in length, or undefined when blank. */
export const normalizeKeyword = (value: string | undefined) =>
  value?.trim().slice(0, MAX_KEYWORD_LENGTH) || undefined;

const toOptions = (
  table: Readonly<Record<number, string>>,
  skip: number[] = [],
): TagOption[] =>
  Object.entries(table)
    .filter(([code]) => !skip.includes(Number(code)))
    .map(([code, label]) => ({ label, value: code }));

// Filter options per type, straight from the TDX code tables. "其他" (the
// catch-all codes) is left out: a filter on it tells the reader nothing.
const TAG_OPTIONS: Record<PlaceType, TagOption[]> = {
  activity: toOptions(EVENT_CLASSES, [9]),
  hotel: [
    ...toOptions(HOTEL_CLASSES, [9]),
    ...[5, 4, 3].map((stars) => ({
      label: HOTEL_STARS[stars],
      value: `star:${stars}`,
    })),
  ],
  restaurant: toOptions(CUISINE_CLASSES, [254]),
  scene: toOptions(ATTRACTION_CLASSES, [254]),
};

export const getTagOptionsFor = (type: PlaceType): TagOption[] =>
  TAG_OPTIONS[type];

/**
 * OData for a tag value, or undefined when it is not one of the type's
 * options.
 */
export const tagFilter = (type: PlaceType, tag: string | undefined) => {
  if (!(tag && TAG_OPTIONS[type].some((option) => option.value === tag))) {
    return;
  }

  const stars = STAR_TAG.exec(tag);

  if (stars) {
    return `HotelStars eq ${stars.groups.stars}`;
  }

  if (!CODE_TAG.test(tag)) {
    return;
  }

  const field = CLASS_FIELD[type];
  const codes = [Number(tag), ...(SUB_CODES[type]?.[tag] ?? [])];
  const clauses = codes.map((code) => `${field}/any(c: c eq ${code})`);

  // TDX answers 500 to `or` or ranges inside one lambda, so each code gets
  // its own any() (verified live).
  return clauses.length > 1 ? `(${clauses.join(' or ')})` : clauses[0];
};

const TAIPEI_DATE = new Intl.DateTimeFormat('en-CA', {
  day: '2-digit',
  month: '2-digit',
  timeZone: 'Asia/Taipei',
  year: 'numeric',
});

const DAY_MS = 86_400_000;

/** `YYYY-MM-DD` of the Taipei calendar day. */
export const taipeiDate = (date: Date) => TAIPEI_DATE.format(date);

/**
 * TDX answers 500 to a full date-time literal in a filter but accepts a
 * bare date (verified live), so activities are filtered by Taipei calendar
 * day: an event ending today still counts as ongoing until the day is over.
 */
const activityFilter = (query: PlaceQuery, now: Date) => {
  const today = taipeiDate(now);
  const tomorrow = taipeiDate(new Date(now.getTime() + DAY_MS));

  switch (query.when) {
    case 'ongoing':
      return `StartDateTime lt ${tomorrow} and EndDateTime ge ${today}`;
    case 'upcoming':
      return `StartDateTime ge ${tomorrow}`;
    default:
      return `EndDateTime ge ${today}`;
  }
};

export const orderByFor = (query: Pick<PlaceQuery, 'type' | 'when'>) => {
  if (query.type !== 'activity') {
    return `UpdateTime desc,${ID_FIELD[query.type]} asc`;
  }

  // Ongoing events by what ends soonest; the rest by what starts first.
  return query.when === 'ongoing'
    ? 'EndDateTime asc,EventID asc'
    : 'StartDateTime asc,EventID asc';
};

export interface ListRequest {
  city?: City;
  page: number;
  pageSize: number;
  params: V2Params;
}

/**
 * Validates a PlaceQuery and turns it into TDX parameters fetching one row
 * more than the page so the caller can tell whether another page exists.
 * Returns undefined for an unknown type or city (treated as not found).
 */
export const buildListRequest = (
  query: PlaceQuery,
  now = new Date(),
): ListRequest | undefined => {
  if (!isPlaceType(query.type)) {
    return;
  }

  if (query.city !== undefined && !isCity(query.city)) {
    return;
  }

  const page = Math.max(1, Math.floor(Number(query.page) || 1));
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, Math.floor(Number(query.pageSize) || DEFAULT_PAGE_SIZE)),
  );
  const keyword = normalizeKeyword(query.keyword);
  const clauses = [
    keyword && `(${constructKeywordFilter(TOURISM_TYPE[query.type], keyword)})`,
    tagFilter(query.type, query.tag),
    query.type === 'activity' && activityFilter(query, now),
    query.type === 'activity' && query.free && 'IsAccessibleForFree eq 1',
  ].filter(Boolean);

  return {
    city: query.city,
    page,
    pageSize,
    params: {
      filter: clauses.length > 0 ? clauses.join(' and ') : undefined,
      orderBy: orderByFor(query),
      skip: (page - 1) * pageSize,
      top: pageSize + 1,
    },
  };
};

/** Whether another page exists, from the raw row count of a pageSize+1 fetch. */
export const hasMoreRows = (fetched: number, pageSize: number) =>
  fetched > pageSize;
