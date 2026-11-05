// The app's data layer over TDX Tourism V2. Every TDX call goes through
// `fetchRecords` / `fetchById`: cached across requests with unstable_cache
// (still supported in Next 16 without `cacheComponents`, which is a
// next.config seam; `use cache` + cacheLife would need it) and deduped per
// request with React cache(). Records are cached raw and mapped per request,
// so derived values such as an event's 進行中 status never go stale.
import type { City } from '@f2e/tdx-core';
import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import {
  fixtureRecords,
  fixtureSnapshot,
  fixturesEnabled,
} from '@/services/place-fixtures';
import {
  type PlaceRecord,
  toDetail,
  toSummary,
} from '@/services/place-mappers';
import {
  buildListRequest,
  getTagOptionsFor,
  hasMoreRows,
  isCity,
  isPlaceType,
  isValidId,
  normalizeKeyword,
  orderByFor,
  snapshotFilter,
} from '@/services/place-queries';
import {
  collectSnapshot,
  filterRecords,
  fitSnapshot,
  idOf,
  matchesKeyword,
  nearbyFrom,
  pageRecords,
  searchRecords,
  sortRecords,
} from '@/services/place-snapshot';
import { tourismService } from '@/services/tdx';
import {
  PLACE_TYPES,
  type PlaceDetail,
  type PlacePage,
  type PlaceQuery,
  type PlaceSummary,
  type PlaceType,
  type TagOption,
} from '@/types/place';

const SIX_HOURS = 6 * 60 * 60;
const ONE_HOUR = 60 * 60;
const DEFAULT_NEARBY = 6;
const DEFAULT_SEARCH_LIMIT = 6;

interface Fetched {
  fetched: number;
  items: PlaceRecord[];
}

const listFor = (type: PlaceType) => {
  switch (type) {
    case 'scene':
      return tourismService.getAttractionsV2;
    case 'restaurant':
      return tourismService.getRestaurantsV2;
    case 'hotel':
      return tourismService.getHotelsV2;
    default:
      return tourismService.getEventsV2;
  }
};

const byIdFor = (type: PlaceType) => {
  switch (type) {
    case 'scene':
      return tourismService.getAttractionByIdV2;
    case 'restaurant':
      return tourismService.getRestaurantByIdV2;
    case 'hotel':
      return tourismService.getHotelByIdV2;
    default:
      return tourismService.getEventByIdV2;
  }
};

const runList = async (
  type: PlaceType,
  filter: string,
  orderBy: string,
  top: number,
  skip: number,
  city: string,
): Promise<Fetched> =>
  (await listFor(type)(
    {
      filter: filter || undefined,
      orderBy: orderBy || undefined,
      skip: skip || undefined,
      top,
    },
    city ? (city as City) : undefined,
  )) as Fetched;

const runById = async (type: PlaceType, id: string) =>
  (await byIdFor(type)(id)) as PlaceRecord | null;

// Primitive arguments only: they are the cache key, for both unstable_cache
// and React cache(). Activities revalidate hourly, the rest every 6 hours.
const cachedList = unstable_cache(runList, ['places:list'], {
  revalidate: SIX_HOURS,
});
const cachedEventList = unstable_cache(runList, ['places:list-events'], {
  revalidate: ONE_HOUR,
});
const cachedById = unstable_cache(runById, ['places:detail'], {
  revalidate: SIX_HOURS,
});
const cachedEventById = unstable_cache(runById, ['places:detail-events'], {
  revalidate: ONE_HOUR,
});

const fetchRecords = cache(
  (
    type: PlaceType,
    filter: string,
    orderBy: string,
    top: number,
    skip: number,
    city: string,
  ): Promise<Fetched> =>
    (type === 'activity' ? cachedEventList : cachedList)(
      type,
      filter,
      orderBy,
      top,
      skip,
      city,
    ),
);

// One cached dataset per (type, city): every list, tag filter, page, nearby
// lookup and city search for that city reads it instead of calling TDX.
// Fetch failures throw (nothing is cached), so callers never see a partial
// city.
const runSnapshot = async (
  type: PlaceType,
  city: string,
): Promise<PlaceRecord[]> => {
  const records = await collectSnapshot(type, async (top, skip) => {
    const result = await listFor(type)(
      {
        filter: snapshotFilter(type, new Date()),
        orderBy: orderByFor({ type }),
        skip: skip || undefined,
        top,
      },
      city as City,
    );

    return result as Fetched;
  });

  // Vercel's data cache drops entries over 2 MB, which would refetch the
  // whole city on every revalidation, so shrink an oversized one first.
  return fitSnapshot(`${type}/${city}`, records);
};

const cachedSnapshot = unstable_cache(runSnapshot, ['places:snapshot'], {
  revalidate: SIX_HOURS,
});
const cachedEventSnapshot = unstable_cache(
  runSnapshot,
  ['places:snapshot-events'],
  { revalidate: ONE_HOUR },
);

const getCitySnapshot = cache(
  (type: PlaceType, city: City): Promise<PlaceRecord[]> => {
    if (fixturesEnabled()) {
      return fixtureSnapshot(type, city);
    }

    return (type === 'activity' ? cachedEventSnapshot : cachedSnapshot)(
      type,
      city,
    );
  },
);

const fetchById = cache((type: PlaceType, id: string) =>
  (type === 'activity' ? cachedEventById : cachedById)(type, id),
);

/** One page of a type's list, newest first; cached server-side. */
export const listPlaces = async (query: PlaceQuery): Promise<PlacePage> => {
  const request = buildListRequest(query);

  if (!request) {
    return { hasMore: false, items: [], page: Math.max(1, query.page ?? 1) };
  }

  if (request.city && !query.keyword && !fixturesEnabled()) {
    const records = await getCitySnapshot(query.type, request.city);
    const { hasMore, rows } = pageRecords(
      sortRecords(
        query.type,
        filterRecords(query, records, new Date()),
        query.when,
      ),
      request.page,
      request.pageSize,
    );

    return {
      hasMore,
      items: rows.map((record) => toSummary(query.type, record)),
      page: request.page,
    };
  }

  if (fixturesEnabled()) {
    // No TDX under `next dev`: query the recorded snapshots locally.
    const keyword = normalizeKeyword(query.keyword);
    const all = request.city
      ? await getCitySnapshot(query.type, request.city)
      : await fixtureRecords(query.type);
    const { hasMore, rows } = pageRecords(
      sortRecords(
        query.type,
        filterRecords(query, all, new Date()).filter(
          (record) =>
            !keyword || matchesKeyword(toSummary(query.type, record), keyword),
        ),
        query.when,
      ),
      request.page,
      request.pageSize,
    );

    return {
      hasMore,
      items: rows.map((record) => toSummary(query.type, record)),
      page: request.page,
    };
  }

  const { params } = request;
  const { fetched, items } = await fetchRecords(
    query.type,
    params.filter ?? '',
    params.orderBy ?? '',
    params.top ?? 0,
    params.skip ?? 0,
    request.city ?? '',
  );

  return {
    hasMore: hasMoreRows(fetched, request.pageSize),
    items: items
      .slice(0, request.pageSize)
      .map((record) => toSummary(query.type, record)),
    page: request.page,
  };
};

/** A single record mapped for the detail page, or undefined when missing. */
export const getPlaceDetail = async (
  type: PlaceType,
  id: string,
): Promise<PlaceDetail | undefined> => {
  if (!(isPlaceType(type) && isValidId(id))) {
    return;
  }

  if (fixturesEnabled()) {
    const found = (await fixtureRecords(type)).find(
      (item) => idOf(type, item) === id,
    );

    return found ? toDetail(type, found) : undefined;
  }

  const record = await fetchById(type, id);

  return record ? toDetail(type, record) : undefined;
};

/** Other places of any type in the same town (fallback: same city), nearest first. */
export const getNearbyPlaces = async (
  detail: PlaceDetail,
  limit = DEFAULT_NEARBY,
): Promise<PlaceSummary[]> => {
  if (!isCity(detail.citySlug)) {
    return [];
  }

  const snapshots = await Promise.all(
    PLACE_TYPES.map(async (type) => {
      try {
        return { records: await getCitySnapshot(type, detail.citySlug), type };
      } catch (error) {
        // Nearby places are extra; a rate-limited type is just left out.
        console.warn(`[places] nearby ${type} unavailable`, error);
        return { records: [], type };
      }
    }),
  );

  return nearbyFrom(detail, snapshots, limit);
};

/** Filter options for a type's tag filter (class names from the TDX code tables). */
export const getTagOptions = (type: PlaceType): TagOption[] =>
  isPlaceType(type) ? getTagOptionsFor(type) : [];

/** Keyword search across every type, optionally in one city; throws only when every type failed. */
export const searchPlaces = async (
  keyword: string,
  limitPerType = DEFAULT_SEARCH_LIMIT,
  city?: City,
): Promise<PlaceSummary[]> => {
  const value = normalizeKeyword(keyword);

  if (!value) {
    return [];
  }

  const results = await Promise.allSettled(
    PLACE_TYPES.map(async (type) => {
      if (city) {
        if (!isCity(city)) {
          return { hasMore: false, items: [], page: 1 };
        }

        // Snapshots carry no descriptions, so a city search matches name,
        // town and tags only.
        return {
          hasMore: false,
          items: searchRecords(
            type,
            await getCitySnapshot(type, city),
            value,
            limitPerType,
          ),
          page: 1,
        };
      }

      return listPlaces({
        city,
        keyword: value,
        page: 1,
        pageSize: limitPerType,
        type,
      });
    }),
  );
  const pages = results.flatMap((result) =>
    result.status === 'fulfilled' ? [result.value] : [],
  );

  // Show whichever types answered; fail only when none did.
  if (pages.length === 0) {
    throw (results[0] as PromiseRejectedResult).reason;
  }

  return pages.flatMap((page) => page.items);
};
