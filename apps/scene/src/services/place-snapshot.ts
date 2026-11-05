// Pure helpers behind the per-city snapshots in services/places.ts: which
// fields a snapshot asks TDX for, how its pages are fetched, how a record is
// trimmed before it is cached, and the local filter / sort / page / search
// that replace one TDX call per query. No Next or network imports, so it
// runs under `bun test`.
import type { EventV2 } from '@f2e/tdx-tourism';

import {
  distanceKm,
  type LatLng,
  type PlaceRecord,
  positionOf,
  toSummary,
} from '@/services/place-mappers';
import { matchesTag } from '@/services/place-queries';
import type {
  ActivityWhen,
  PlaceQuery,
  PlaceSummary,
  PlaceType,
} from '@/types/place';

/** TDX V2 rejects $top above 500 (verified live). */
export const SNAPSHOT_PAGE_SIZE = 500;
export const SNAPSHOT_MAX_PAGES = 8;
/** Vercel's data cache rejects items over 2 MB; stay under with headroom. */
export const SNAPSHOT_MAX_BYTES = 1_900_000;

const COMMON_FIELDS = [
  'PostalAddress',
  'PositionLat',
  'PositionLon',
  'Images',
  'UpdateTime',
];

// Exactly what toSummary, the local filters and nearby read: no Description,
// TrafficInfo or RoomInfo (detail pages fetch the full record by id). TDX
// answers 500 to a $select naming a collection field (Images, the class
// arrays, Tags: verified live), and the snapshot needs those, so records
// are fetched whole and cut down to these fields before they are cached.
const KEEP: Record<PlaceType, string[]> = {
  activity: [
    'EventID',
    'EventName',
    'EventClasses',
    'StartDateTime',
    'EndDateTime',
    'IsAccessibleForFree',
    'Tags',
  ],
  hotel: [
    'HotelID',
    'HotelName',
    'HotelClasses',
    'HotelStars',
    'LowestPrice',
    'CeilingPrice',
  ],
  restaurant: [
    'RestaurantID',
    'RestaurantName',
    'CuisineClasses',
    'RestaurantFeatures',
    'ServiceTimeInfo',
  ],
  scene: [
    'AttractionID',
    'AttractionName',
    'AttractionClasses',
    'IsAccessibleForFree',
    'ServiceTimeInfo',
    'FeeInfo',
    'Tags',
  ],
};

// toSummary shortens these to 40 characters; keep one more so the ellipsis
// decision is unchanged.
const FACT_KEEP = 41;
const flat = (value: unknown) =>
  typeof value === 'string'
    ? value.replace(/\s+/gu, ' ').trim().slice(0, FACT_KEEP)
    : value;

/**
 * Shrinks a validated record to the fields in KEEP: the first image, the town
 * and city, and short fact lines. Everything toSummary reads gives the same
 * result before and after.
 */
export const trimRecord = (type: PlaceType, record: PlaceRecord) => {
  const row = record as unknown as Record<string, unknown>;
  const kept = Object.fromEntries(
    [...KEEP[type], ...COMMON_FIELDS].flatMap((key) =>
      row[key] === undefined ? [] : [[key, row[key]]],
    ),
  );
  const [image] = (record.Images ?? []) as {
    Description?: string;
    Name?: string;
    URL: string;
  }[];

  return {
    ...kept,
    FeeInfo: flat(row.FeeInfo),
    Images: image
      ? [{ Description: image.Description, Name: image.Name, URL: image.URL }]
      : undefined,
    PostalAddress: {
      City: record.PostalAddress.City,
      Town: record.PostalAddress.Town,
    },
    ServiceTimeInfo: flat(row.ServiceTimeInfo),
  } as unknown as PlaceRecord;
};

interface Page {
  fetched: number;
  items: PlaceRecord[];
}

export type FetchPage = (top: number, skip: number) => Promise<Page>;

/**
 * Pages through a city's list until TDX returns a short page, or the page
 * cap. Rows are trimmed as they arrive. A failed page throws, so a partial
 * snapshot is never cached.
 */
export const collectSnapshot = async (
  type: PlaceType,
  fetchPage: FetchPage,
  warn: (message: string) => void = console.warn,
): Promise<PlaceRecord[]> => {
  const records: PlaceRecord[] = [];

  for (let page = 0; page < SNAPSHOT_MAX_PAGES; page += 1) {
    // Pages are sequential: they share the 5 requests a minute budget.
    // biome-ignore lint/performance/noAwaitInLoops: each page depends on the previous one being full
    const { fetched, items } = await fetchPage(
      SNAPSHOT_PAGE_SIZE,
      page * SNAPSHOT_PAGE_SIZE,
    );

    records.push(...items.map((item) => trimRecord(type, item)));

    if (fetched < SNAPSHOT_PAGE_SIZE) {
      return records;
    }
  }

  warn(
    `[places] snapshot hit the ${SNAPSHOT_MAX_PAGES}-page cap (${records.length} records); the rest is left out`,
  );

  return records;
};

/** Serialized size in bytes, as the data cache will store it. */
export const snapshotBytes = (records: PlaceRecord[]) =>
  new TextEncoder().encode(JSON.stringify(records)).length;

/**
 * Keeps a snapshot under SNAPSHOT_MAX_BYTES so the data cache accepts it:
 * first drops the cover images (cards fall back to a placeholder), then the
 * free-text fact lines, then whole records from the end of the list.
 */
export const fitSnapshot = (
  label: string,
  records: PlaceRecord[],
  warn: (message: string) => void = console.warn,
): PlaceRecord[] => {
  if (snapshotBytes(records) <= SNAPSHOT_MAX_BYTES) {
    return records;
  }

  const without = (rows: PlaceRecord[], keys: string[]) =>
    rows.map((row) => {
      const copy = { ...(row as unknown as Record<string, unknown>) };

      for (const key of keys) {
        delete copy[key];
      }

      return copy as unknown as PlaceRecord;
    });
  let fitted = without(records, ['Images']);

  if (snapshotBytes(fitted) > SNAPSHOT_MAX_BYTES) {
    fitted = without(fitted, ['FeeInfo', 'ServiceTimeInfo']);
  }

  while (snapshotBytes(fitted) > SNAPSHOT_MAX_BYTES) {
    fitted = fitted.slice(0, Math.floor(fitted.length * 0.9));
  }

  warn(
    `[places] ${label} snapshot exceeded the 2 MB data cache limit; slimmed to ${fitted.length} of ${records.length} records`,
  );

  return fitted;
};

const ID_FIELD: Record<PlaceType, string> = {
  activity: 'EventID',
  hotel: 'HotelID',
  restaurant: 'RestaurantID',
  scene: 'AttractionID',
};

const startOf = (record: PlaceRecord) => (record as EventV2).StartDateTime;
const endOf = (record: PlaceRecord) => (record as EventV2).EndDateTime;
export const idOf = (type: PlaceType, record: PlaceRecord) =>
  (record as unknown as Record<string, string>)[ID_FIELD[type]];

/** Exact-time version of the `when` filter TDX could only do by day. */
const matchesWhen = (
  record: PlaceRecord,
  when: ActivityWhen | undefined,
  now: Date,
) => {
  const time = now.getTime();
  const start = Date.parse(startOf(record));
  const end = Date.parse(endOf(record));

  switch (when) {
    case 'ongoing':
      return start <= time && time <= end;
    case 'upcoming':
      return start > time;
    default:
      return end >= time;
  }
};

const compare = (a: string | undefined, b: string | undefined) =>
  (a ?? '') < (b ?? '') ? -1 : Number((a ?? '') > (b ?? ''));

/** Same order as orderByFor: places newest first, events by end or start. */
export const sortRecords = (
  type: PlaceType,
  records: PlaceRecord[],
  when?: ActivityWhen,
) =>
  [...records].sort((a, b) => {
    let order: number;

    if (type !== 'activity') {
      order = compare(b.UpdateTime, a.UpdateTime);
    } else if (when === 'ongoing') {
      order = compare(endOf(a), endOf(b));
    } else {
      order = compare(startOf(a), startOf(b));
    }

    return order || compare(idOf(type, a), idOf(type, b));
  });

export type SnapshotQuery = Pick<
  PlaceQuery,
  'free' | 'page' | 'pageSize' | 'tag' | 'type' | 'when'
>;

/** Tag, when and free filters of a list query, applied to a snapshot. */
export const filterRecords = (
  query: SnapshotQuery,
  records: PlaceRecord[],
  now: Date,
) =>
  records.filter(
    (record) =>
      matchesTag(query.type, record, query.tag) &&
      (query.type !== 'activity' ||
        (matchesWhen(record, query.when, now) &&
          !(query.free && (record as EventV2).IsAccessibleForFree !== 1))),
  );

/** One page of a snapshot; hasMore comes from the filtered length. */
export const pageRecords = <T>(rows: T[], page: number, pageSize: number) => ({
  hasMore: page * pageSize < rows.length,
  rows: rows.slice((page - 1) * pageSize, page * pageSize),
});

const cleanText = (value: string | undefined) => value?.trim().toLowerCase();

/** Case-insensitive match on name, town and tags (no descriptions in a snapshot). */
export const matchesKeyword = (summary: PlaceSummary, keyword: string) => {
  const needle = cleanText(keyword);

  return (
    !!needle &&
    [summary.name, summary.town, ...summary.tags].some((field) =>
      cleanText(field)?.includes(needle),
    )
  );
};

export const searchRecords = (
  type: PlaceType,
  records: PlaceRecord[],
  keyword: string,
  limit: number,
) =>
  records
    .map((record) => toSummary(type, record))
    .filter((summary) => matchesKeyword(summary, keyword))
    .slice(0, limit);

export interface NearbyOrigin {
  id: string;
  name: string;
  position?: LatLng;
  town?: string;
  type: PlaceType;
}

/**
 * Other places around `origin` from the snapshots, nearest first: same town
 * when the origin has one (else the whole city), without the origin itself.
 * Several agencies publish the same place under different IDs, so match on
 * name as well as ID, and keep one record per type and name.
 */
export const nearbyFrom = (
  origin: NearbyOrigin,
  snapshots: { records: PlaceRecord[]; type: PlaceType }[],
  limit: number,
): PlaceSummary[] => {
  const candidates = snapshots
    .flatMap(({ records, type }) => records.map((record) => ({ record, type })))
    .map(({ record, type }) => {
      const point = positionOf(record);

      return {
        distance:
          origin.position && point
            ? distanceKm(origin.position, point)
            : undefined,
        summary: toSummary(type, record),
      };
    })
    .filter(({ summary }) => !origin.town || summary.town === origin.town)
    .filter(
      ({ summary }) =>
        !(
          summary.type === origin.type &&
          (summary.id === origin.id || summary.name === origin.name)
        ),
    )
    .filter(
      ({ summary }, index, all) =>
        all.findIndex(
          (other) =>
            other.summary.type === summary.type &&
            other.summary.name === summary.name,
        ) === index,
    );

  candidates.sort(
    (a, b) =>
      (a.distance ?? Number.POSITIVE_INFINITY) -
      (b.distance ?? Number.POSITIVE_INFINITY),
  );

  return candidates.slice(0, limit).map(({ summary }) => summary);
};
