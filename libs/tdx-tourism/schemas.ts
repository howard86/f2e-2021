import { type City, CityMap, CitySet } from '@f2e/tdx-core';
import { z } from 'zod';

import type { TourismPropertyType } from './tourism';

// Validates raw Tourism V2 records before they are mapped, so the UI only
// receives items it can render: an item missing what every card and detail
// page needs (ID, name, a known city, and for events valid dates) is
// skipped, while a malformed optional field is dropped instead of failing
// the whole item. Fields outside the shapes below pass through untouched.

/** Optional field: null and invalid values both become undefined. */
const optional = <T extends z.ZodType>(schema: T) =>
  schema
    .nullish()
    .transform((value) => value ?? undefined)
    .catch(undefined);

/** Optional list: keeps the valid entries and drops the rest. */
const validEntries = <T extends z.ZodType>(schema: T) =>
  z
    .array(z.unknown())
    .nullish()
    .catch(undefined)
    .transform((entries) =>
      entries?.flatMap((entry) => {
        const result = schema.safeParse(entry);

        return result.success ? [result.data as z.output<T>] : [];
      }),
    );

const requiredText = z.string().trim().min(1);
const text = optional(z.string());
const httpUrl = z.url({ protocol: /^https?$/u });
const dateTime = z.iso.datetime({ local: true, offset: true });

const classes = validEntries(z.number().int());

const common = {
  Description: text,
  Facilities: classes,
  Images: validEntries(
    z.looseObject({ Description: text, Name: text, URL: httpUrl }),
  ),
  LocatedCities: validEntries(z.looseObject({ City: requiredText })),
  MapURLs: validEntries(httpUrl),
  ParkingInfo: text,
  PaymentMethods: validEntries(requiredText),
  PositionLat: optional(z.number()),
  PositionLon: optional(z.number()),
  PostalAddress: optional(
    z.looseObject({
      City: text,
      StreetAddress: text,
      Town: text,
      ZipCode: text,
    }),
  ),
  ReservationURLs: validEntries(httpUrl),
  SocialMediaURLs: validEntries(z.looseObject({ Name: text, URL: httpUrl })),
  Telephones: validEntries(z.looseObject({ Ext: text, Tel: requiredText })),
  UpdateTime: text,
  WebsiteUrl: optional(httpUrl),
};

const organizations = validEntries(
  z.looseObject({
    Class: text,
    Faxes: validEntries(requiredText),
    Name: text,
  }),
);

interface CityFields {
  LocatedCities?: { City: string }[];
  PostalAddress?: { City?: string };
}

const CITY_NAMES = CityMap as Record<string, string>;

/**
 * Pages link items under `/<city>/…`, so the city has to resolve. TDX mixes
 * 台 and 臺 (台中市 / 臺中市); normalise to the 臺 form CityMap uses.
 */
const withKnownCity = <T extends CityFields>(
  item: T,
  ctx: z.RefinementCtx<T>,
): T => {
  const name = (item.PostalAddress?.City || item.LocatedCities?.[0]?.City)
    ?.trim()
    .replaceAll('台', '臺');

  if (!(name && CitySet.has(CITY_NAMES[name] as City))) {
    ctx.addIssue({
      code: 'custom',
      input: name,
      message: `unknown city: ${name ?? '(none)'}`,
      path: ['PostalAddress', 'City'],
    });

    return z.NEVER;
  }

  return { ...item, PostalAddress: { ...item.PostalAddress, City: name } };
};

const attraction = z
  .looseObject({
    ...common,
    AssetsClass: optional(z.number().int()),
    AttractionClasses: classes,
    AttractionID: requiredText,
    AttractionName: requiredText,
    FeeInfo: text,
    IsAccessibleForFree: optional(z.number().int()),
    Remarks: text,
    ServiceStatus: optional(z.number().int()),
    ServiceTimeInfo: text,
    Tags: validEntries(requiredText),
    TrafficInfo: text,
  })
  .transform(withKnownCity);

const restaurant = z
  .looseObject({
    ...common,
    CuisineClasses: classes,
    Remarks: text,
    RestaurantFeatures: classes,
    RestaurantID: requiredText,
    RestaurantName: requiredText,
    ServiceStatus: optional(z.number().int()),
    ServiceTimeInfo: text,
    TrafficInfo: text,
  })
  .transform(withKnownCity);

const hotel = z
  .looseObject({
    ...common,
    CeilingPrice: optional(z.number().nonnegative()),
    CheckTimes: validEntries(
      z.looseObject({ CheckInTime: text, CheckOutTime: text }),
    ),
    HotelClasses: classes,
    HotelID: requiredText,
    HotelName: requiredText,
    // 0 = none ... 5 = 5 stars, 6 = 卓越5星級 (HotelStarsEnum).
    HotelStars: optional(z.number().int().min(0).max(6)),
    LowestPrice: optional(z.number().nonnegative()),
    Organizations: organizations,
    Remarks: text,
    RoomInfo: text,
    ServiceInfo: text,
    ServiceStatus: optional(z.number().int()),
    ServiceTimeInfo: text,
    TotalRooms: optional(z.number().int().nonnegative()),
    TrafficInfo: text,
  })
  .transform(withKnownCity);

const event = z
  .looseObject({
    ...common,
    CalendarURLs: validEntries(httpUrl),
    EndDateTime: dateTime,
    EventClasses: classes,
    EventID: requiredText,
    EventName: requiredText,
    EventStatus: text,
    FeeInfo: text,
    IsAccessibleForFree: optional(z.number().int()),
    Organizations: organizations,
    Participant: text,
    Remarks: text,
    StartDateTime: dateTime,
    Tags: validEntries(requiredText),
    TrafficInfo: text,
  })
  .refine(
    (item) => Date.parse(item.EndDateTime) >= Date.parse(item.StartDateTime),
    { message: 'ends before it starts', path: ['EndDateTime'] },
  )
  .transform(withKnownCity);

const SCHEMAS = {
  Activity: { id: 'EventID', schema: event },
  Hotel: { id: 'HotelID', schema: hotel },
  Restaurant: { id: 'RestaurantID', schema: restaurant },
  ScenicSpot: { id: 'AttractionID', schema: attraction },
} satisfies Record<TourismPropertyType, { id: string; schema: z.ZodType }>;

interface SkippedItem {
  id?: string;
  reason: string;
}

/** Splits raw V2 items into those the UI can render and those it skips. */
export const parseTourismItems = (
  type: TourismPropertyType,
  items: unknown[],
) => {
  const { id, schema } = SCHEMAS[type];
  const valid: Record<string, unknown>[] = [];
  const skipped: SkippedItem[] = [];

  for (const item of items) {
    const result = schema.safeParse(item);

    if (result.success) {
      valid.push(result.data);
    } else {
      const rawId = (item as Record<string, unknown> | null)?.[id];

      skipped.push({
        id: typeof rawId === 'string' ? rawId : undefined,
        reason: result.error.issues
          .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
          .join(', '),
      });
    }
  }

  return { skipped, valid };
};
