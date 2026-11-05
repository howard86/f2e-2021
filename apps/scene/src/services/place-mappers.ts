// Pure mapping from validated TDX Tourism V2 records to the app's
// PlaceSummary / PlaceDetail. No Next or network imports, so it runs under
// `bun test`; services/places.ts supplies the (cached) records.
import { type City, CityMap } from '@f2e/tdx-core';
import {
  ATTRACTION_CLASSES,
  type AttractionV2,
  CUISINE_CLASSES,
  EVENT_CLASSES,
  EVENT_STATUSES,
  type EventV2,
  FACILITIES,
  HOTEL_CLASSES,
  HOTEL_STARS,
  type HotelV2,
  labelsOf,
  PAYMENT_METHODS,
  RESTAURANT_FEATURES,
  type RestaurantV2,
  splitTrafficInfo,
} from '@f2e/tdx-tourism';

import {
  type PlaceDetail,
  type PlaceFact,
  type PlaceImage,
  type PlaceSection,
  type PlaceSummary,
  type PlaceType,
  placeHref,
} from '@/types/place';

export type PlaceRecord = AttractionV2 | EventV2 | HotelV2 | RestaurantV2;

const MAX_TAGS = 6;
const KEY_FACT_LENGTH = 40;

const clean = (value: string | null | undefined) =>
  value?.replaceAll('\r\n', '\n').trim() || undefined;

const shorten = (value: string | null | undefined, max = KEY_FACT_LENGTH) => {
  const flat = value?.replace(/\s+/gu, ' ').trim();

  if (!flat) {
    return;
  }

  return flat.length > max ? `${flat.slice(0, max - 1)}…` : flat;
};

/** Class labels first, then TDX tags: deduplicated, at most MAX_TAGS. */
export const mergeTags = (labels: string[], tags?: string[] | null) =>
  [
    ...new Set(
      [...labels, ...(tags ?? [])].map((tag) => tag.trim()).filter(Boolean),
    ),
  ].slice(0, MAX_TAGS);

const NUMBER = new Intl.NumberFormat('zh-TW');
const DATE = new Intl.DateTimeFormat('zh-TW', {
  day: 'numeric',
  month: 'numeric',
  timeZone: 'Asia/Taipei',
  year: 'numeric',
});
const TIME = new Intl.DateTimeFormat('zh-TW', {
  hour: '2-digit',
  hour12: false,
  minute: '2-digit',
  timeZone: 'Asia/Taipei',
});

const formatPrice = (value: number | null | undefined) =>
  value && value > 0 ? `NT$ ${NUMBER.format(value)}` : undefined;

export const formatPriceRange = (
  low: number | null | undefined,
  high: number | null | undefined,
) => {
  const from = formatPrice(low);
  const to = formatPrice(high);

  if (from && to) {
    return low === high ? from : `${from} – ${to}`;
  }

  return from ? `${from} 起` : undefined;
};

const isMidnightOrDayEnd = (iso: string) => {
  const time = TIME.format(new Date(iso));

  return time === '00:00' || time === '23:59' || time === '24:00';
};

const formatDay = (iso: string) => DATE.format(new Date(iso));

/** `2026/12/31 – 2027/1/1`, or a single day when both ends fall on it. */
export const formatDateRange = (start: string, end: string) => {
  const from = formatDay(start);
  const to = formatDay(end);

  return from === to ? from : `${from} – ${to}`;
};

const formatDateTime = (iso: string) =>
  isMidnightOrDayEnd(iso)
    ? formatDay(iso)
    : `${formatDay(iso)} ${TIME.format(new Date(iso))}`;

/** Date range with clock times where the source gives them. */
export const formatEventTime = (start: string, end: string) =>
  isMidnightOrDayEnd(start) && isMidnightOrDayEnd(end)
    ? formatDateRange(start, end)
    : `${formatDateTime(start)} – ${formatDateTime(end)}`;

export interface LatLng {
  lat: number;
  lng: number;
}

export const positionOf = (record: PlaceRecord): LatLng | undefined => {
  const lat = Number(record.PositionLat);
  const lng = Number(record.PositionLon);

  return Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    !(lat === 0 && lng === 0)
    ? { lat, lng }
    : undefined;
};

/** Haversine distance in kilometres. */
export const distanceKm = (a: LatLng, b: LatLng) => {
  const rad = (deg: number) => (deg * Math.PI) / 180;
  const h =
    Math.sin(rad(b.lat - a.lat) / 2) ** 2 +
    Math.cos(rad(a.lat)) *
      Math.cos(rad(b.lat)) *
      Math.sin(rad(b.lng - a.lng) / 2) ** 2;

  return 12_742 * Math.asin(Math.sqrt(h));
};

const addressOf = (record: PlaceRecord) => {
  const {
    City: city,
    StreetAddress: street,
    Town: town,
  } = record.PostalAddress;

  if (street?.startsWith(city)) {
    return street;
  }

  return [city, town, street].filter(Boolean).join('');
};

const mapHref = (record: PlaceRecord) => {
  if (record.MapURLs?.[0]) {
    return record.MapURLs[0];
  }

  const point = positionOf(record);
  const query = point
    ? `${point.lat},${point.lng}`
    : encodeURIComponent(addressOf(record));

  return `https://www.google.com/maps/search/?api=1&query=${query}`;
};

const phoneOf = (record: PlaceRecord) => {
  const phone = record.Telephones?.[0];

  if (!phone?.Tel) {
    return;
  }

  const dial = phone.Tel.replace(/[^\d+]/gu, '');

  return {
    href: dial ? `tel:${dial}${phone.Ext ? `,${phone.Ext}` : ''}` : undefined,
    value: phone.Ext ? `${phone.Tel} #${phone.Ext}` : phone.Tel,
  };
};

const imagesOf = (record: PlaceRecord): PlaceImage[] => {
  const seen = new Set<string>();
  const images: PlaceImage[] = [];

  for (const image of record.Images ?? []) {
    if (!image.URL || seen.has(image.URL)) {
      continue;
    }

    seen.add(image.URL);

    const caption = clean(image.Description) ?? clean(image.Name);

    images.push(caption ? { caption, url: image.URL } : { url: image.URL });
  }

  return images;
};

// HotelStarsEnum: 0 none, 1-5 stars, 6 卓越5星級.
const starsLabel = (stars: number | null | undefined) =>
  stars && stars > 0 ? HOTEL_STARS[stars] : undefined;

const starsText = (stars: number | null | undefined) =>
  stars && stars > 0
    ? `${'★'.repeat(Math.min(stars, 5))} ${HOTEL_STARS[stars] ?? ''}`.trim()
    : undefined;

const freeOf = (flag: number | null | undefined) =>
  flag === null || flag === undefined ? undefined : flag === 1;

/** Per-type pieces the summary shares across types. */
interface Core {
  endDate?: string;
  id: string;
  isFree?: boolean;
  keyFact?: string;
  labels: string[];
  name: string;
  startDate?: string;
  tags?: string[] | null;
}

const coreOf = (type: PlaceType, record: PlaceRecord): Core => {
  switch (type) {
    case 'scene': {
      const r = record as AttractionV2;

      return {
        id: r.AttractionID,
        isFree: freeOf(r.IsAccessibleForFree),
        keyFact:
          shorten(r.ServiceTimeInfo) ??
          shorten(r.FeeInfo) ??
          (r.IsAccessibleForFree === 1 ? '免費入場' : undefined),
        labels: labelsOf(ATTRACTION_CLASSES, r.AttractionClasses),
        name: r.AttractionName,
        tags: r.Tags,
      };
    }
    case 'restaurant': {
      const r = record as RestaurantV2;

      return {
        id: r.RestaurantID,
        keyFact: shorten(r.ServiceTimeInfo),
        labels: [
          ...labelsOf(CUISINE_CLASSES, r.CuisineClasses),
          ...labelsOf(RESTAURANT_FEATURES, r.RestaurantFeatures),
        ],
        name: r.RestaurantName,
      };
    }
    case 'hotel': {
      const r = record as HotelV2;
      const stars = starsLabel(r.HotelStars);

      return {
        id: r.HotelID,
        keyFact: formatPriceRange(r.LowestPrice, r.CeilingPrice) ?? stars,
        labels: [
          ...labelsOf(HOTEL_CLASSES, r.HotelClasses),
          ...(stars ? [stars] : []),
        ],
        name: r.HotelName,
      };
    }
    default: {
      const r = record as EventV2;

      return {
        endDate: r.EndDateTime,
        id: r.EventID,
        isFree: freeOf(r.IsAccessibleForFree),
        keyFact: formatDateRange(r.StartDateTime, r.EndDateTime),
        labels: labelsOf(EVENT_CLASSES, r.EventClasses),
        name: r.EventName,
        startDate: r.StartDateTime,
        tags: r.Tags,
      };
    }
  }
};

const omitUndefined = <T extends object>(value: T): T =>
  Object.fromEntries(
    Object.entries(value).filter(([, v]) => v !== undefined),
  ) as T;

export const toSummary = (
  type: PlaceType,
  record: PlaceRecord,
): PlaceSummary => {
  const core = coreOf(type, record);
  const city = record.PostalAddress.City;
  const citySlug = CityMap[city as keyof typeof CityMap] as City;
  const [image] = imagesOf(record);

  return omitUndefined({
    city,
    citySlug,
    endDate: core.endDate,
    href: placeHref(type, citySlug, core.id),
    id: core.id,
    image,
    isFree: core.isFree,
    keyFact: core.keyFact,
    name: core.name,
    startDate: core.startDate,
    tags: mergeTags(core.labels, core.tags),
    town: clean(record.PostalAddress.Town),
    type,
  });
};

// Hotel RoomInfo is often "雙人房34419;套房107184;…": room type then its
// nightly price (the totals match LowestPrice / CeilingPrice). Show those as
// lines; any other shape stays as written.
const ROOM_ENTRY = /^(?<name>\D+?)(?<price>\d{3,7})$/u;
const ROOM_SEPARATOR = /[;；]/u;
const SERVICE_SEPARATOR = /[,，]/u;

export const formatRoomInfo = (value: string | null | undefined) => {
  const text = clean(value);

  if (!text) {
    return;
  }

  const entries = text
    .split(ROOM_SEPARATOR)
    .map((entry) => entry.trim())
    .filter(Boolean);
  const parsed = entries.map((entry) => ROOM_ENTRY.exec(entry));

  if (entries.length === 0 || parsed.some((match) => !match)) {
    return text;
  }

  return [
    ...new Set(
      parsed.map(
        (match) =>
          `${match.groups.name.trim()}　NT$ ${NUMBER.format(Number(match.groups.price))}`,
      ),
    ),
  ].join('\n');
};

// Hotel ServiceInfo is a comma list that often carries empty entries.
const formatServiceInfo = (value: string | null | undefined) => {
  const text = clean(value);
  const items = text
    ?.split(SERVICE_SEPARATOR)
    .map((item) => item.trim())
    .filter(Boolean);

  return items && items.length > 1 ? [...new Set(items)].join('、') : text;
};

const organizerOf = (record: EventV2) => {
  const names = (record.Organizations ?? [])
    .filter(
      (org) => org.Class === 'Organizer' || org.Class === 'ExecutiveOrganizer',
    )
    .map((org) => clean(org.Name))
    .filter(Boolean);

  return names.length > 0 ? [...new Set(names)].join('、') : undefined;
};

const SERVICE_STATUS: Record<number, PlaceDetail['status']> = {
  0: { label: '停止營運', tone: 'negative' },
  1: { label: '正常營運', tone: 'positive' },
  2: { label: '非營運時段', tone: 'neutral' },
  3: { label: '暫停營運', tone: 'neutral' },
};

const EVENT_STATUS_TONE = {
  EventCancelled: 'negative',
  EventPostponed: 'neutral',
  EventRescheduled: 'neutral',
} as const;

export const statusOf = (
  type: PlaceType,
  record: PlaceRecord,
  now = new Date(),
): PlaceDetail['status'] => {
  if (type !== 'activity') {
    const code = (record as AttractionV2).ServiceStatus;

    return code === null || code === undefined
      ? undefined
      : SERVICE_STATUS[code];
  }

  const event = record as EventV2;
  const tone =
    EVENT_STATUS_TONE[event.EventStatus as keyof typeof EVENT_STATUS_TONE];

  if (tone) {
    return { label: EVENT_STATUSES[event.EventStatus], tone };
  }

  const time = now.getTime();

  if (time < Date.parse(event.StartDateTime)) {
    return { label: '尚未開始', tone: 'neutral' };
  }

  return time <= Date.parse(event.EndDateTime)
    ? { label: '進行中', tone: 'positive' }
    : { label: '已結束', tone: 'neutral' };
};

const fact = (
  key: string,
  label: string,
  value: string | undefined,
  extra: Partial<PlaceFact> = {},
): PlaceFact[] =>
  value ? [{ key, kind: 'text', label, value, ...extra }] : [];

const LEADING_WWW = /^www\./u;

/** Display a link fact by its host; the full URL stays in href. */
const hostOf = (url?: string) => {
  if (!url) {
    return;
  }

  try {
    return new URL(url).hostname.replace(LEADING_WWW, '');
  } catch {
    return url;
  }
};

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: one flat list of per-type facts in display order.
const factsOf = (type: PlaceType, record: PlaceRecord): PlaceFact[] => {
  const phone = phoneOf(record);
  const scene = record as AttractionV2;
  const restaurant = record as RestaurantV2;
  const hotel = record as HotelV2;
  const event = record as EventV2;
  const isEvent = type === 'activity';
  const isHotel = type === 'hotel';
  const check = hotel.CheckTimes?.[0];
  const payments = [
    ...new Set(
      (record.PaymentMethods ?? [])
        .map((code) => PAYMENT_METHODS[code])
        .filter(Boolean),
    ),
  ].join('、');
  const website = record.WebsiteUrl || undefined;
  const reservation = record.ReservationURLs?.[0];

  return [
    ...fact('address', '地址', addressOf(record), {
      href: mapHref(record),
      kind: 'map',
    }),
    ...fact('phone', '電話', phone?.value, {
      href: phone?.href,
      kind: 'phone',
    }),
    ...fact(
      'hours',
      type === 'scene' ? '開放時間' : '營業時間',
      isEvent
        ? undefined
        : clean(
            scene.ServiceTimeInfo ??
              restaurant.ServiceTimeInfo ??
              hotel.ServiceTimeInfo,
          ),
    ),
    ...fact(
      'fee',
      isEvent ? '票價' : '費用',
      type === 'scene' || isEvent
        ? clean(scene.FeeInfo ?? event.FeeInfo)
        : undefined,
    ),
    ...fact(
      'dates',
      '活動時間',
      isEvent
        ? formatEventTime(event.StartDateTime, event.EndDateTime)
        : undefined,
    ),
    ...fact(
      'price',
      '房價',
      isHotel
        ? formatPriceRange(hotel.LowestPrice, hotel.CeilingPrice)
        : undefined,
    ),
    ...fact(
      'rooms',
      '房間數',
      isHotel && hotel.TotalRooms ? `${hotel.TotalRooms} 間` : undefined,
    ),
    ...fact(
      'check',
      '入住/退房',
      check && (check.CheckInTime || check.CheckOutTime)
        ? `${check.CheckInTime || '—'} / ${check.CheckOutTime || '—'}`
        : undefined,
    ),
    ...fact('stars', '星級', isHotel ? starsText(hotel.HotelStars) : undefined),
    ...fact('organizer', '主辦單位', isEvent ? organizerOf(event) : undefined),
    ...fact(
      'participant',
      '參與對象',
      isEvent ? clean(event.Participant) : undefined,
    ),
    ...fact('payment', '付款方式', payments || undefined),
    ...fact('website', '官網', hostOf(website), {
      href: website,
      kind: 'link',
    }),
    ...fact('reservation', isHotel ? '訂房' : '預約', hostOf(reservation), {
      href: reservation,
      kind: 'link',
    }),
  ];
};

const section = (
  key: string,
  title: string,
  body: string | undefined,
  steps?: PlaceSection['steps'],
): PlaceSection[] => (body ? [omitUndefined({ body, key, steps, title })] : []);

const sectionsOf = (type: PlaceType, record: PlaceRecord): PlaceSection[] => {
  const traffic = clean((record as AttractionV2).TrafficInfo);
  const hotel = record as HotelV2;
  const facilities = labelsOf(FACILITIES, record.Facilities).join('、');
  const services =
    type === 'hotel'
      ? [formatServiceInfo(hotel.ServiceInfo), facilities]
          .filter(Boolean)
          .join('\n')
      : facilities;

  return [
    ...section('traffic', '交通方式', traffic, splitTrafficInfo(traffic)),
    ...section('parking', '停車資訊', clean(record.ParkingInfo)),
    ...section(
      'rooms',
      '房型介紹',
      type === 'hotel' ? formatRoomInfo(hotel.RoomInfo) : undefined,
    ),
    ...section('services', '服務設施', services || undefined),
    ...section('remarks', '備註', clean((record as AttractionV2).Remarks)),
  ];
};

export const toDetail = (
  type: PlaceType,
  record: PlaceRecord,
  now = new Date(),
): PlaceDetail => {
  const event = record as EventV2;

  return omitUndefined({
    ...toSummary(type, record),
    calendar:
      type === 'activity'
        ? { end: event.EndDateTime, start: event.StartDateTime }
        : undefined,
    description: clean(record.Description),
    facts: factsOf(type, record),
    images: imagesOf(record),
    position: positionOf(record),
    reservationUrl: record.ReservationURLs?.[0],
    sections: sectionsOf(type, record),
    status: statusOf(type, record, now),
    updatedAt: record.UpdateTime,
    websiteUrl: record.WebsiteUrl || undefined,
  });
};
