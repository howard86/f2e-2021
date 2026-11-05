import type { City } from '@f2e/tdx-core';

import type { Category } from '@/constants/categories';

// The app's own view of a TDX Tourism V2 record. services/places.ts maps the
// raw records into these shapes; every page and component reads only these.

export type PlaceType = 'activity' | 'hotel' | 'restaurant' | 'scene';

export const PLACE_TYPES: PlaceType[] = [
  'scene',
  'restaurant',
  'hotel',
  'activity',
];

export const PLACE_CATEGORY: Record<PlaceType, Category> = {
  activity: 'activities',
  hotel: 'hotels',
  restaurant: 'restaurants',
  scene: 'scenes',
};

export const PLACE_LABEL: Record<PlaceType, string> = {
  activity: '活動',
  hotel: '住宿',
  restaurant: '美食',
  scene: '景點',
};

/** List page for each type; detail routes live at `/<citySlug>/<type>/<id>`. */
export const PLACE_LIST_HREF: Record<PlaceType, string> = {
  activity: '/events',
  hotel: '/hotels',
  restaurant: '/restaurants',
  scene: '/scenes',
};

export const placeHref = (type: PlaceType, citySlug: City, id: string) =>
  `/${citySlug}/${type}/${encodeURIComponent(id)}`;

export interface PlaceImage {
  caption?: string;
  url: string;
}

export interface PlaceSummary {
  /** Chinese city name, e.g. 臺北市. */
  city: string;
  /** Route slug for the city, e.g. Taipei. */
  citySlug: City;
  /** ISO date-time; activities only. */
  endDate?: string;
  href: string;
  id: string;
  image?: PlaceImage;
  isFree?: boolean;
  /** One short line for the card: hours, price range or date range. */
  keyFact?: string;
  name: string;
  /** ISO date-time; activities only. */
  startDate?: string;
  /** Human-readable labels: class names first, then TDX tags. */
  tags: string[];
  town?: string;
  type: PlaceType;
}

type PlaceFactKind = 'link' | 'map' | 'phone' | 'text';

export interface PlaceFact {
  href?: string;
  key: string;
  kind: PlaceFactKind;
  label: string;
  value: string;
}

export interface PlaceSection {
  body: string;
  key: string;
  /** Set when the body is a run of steps, e.g. TrafficInfo split on ［…］. */
  steps?: { heading?: string; text: string }[];
  title: string;
}

export type PlaceStatusTone = 'negative' | 'neutral' | 'positive';

export interface PlaceDetail extends PlaceSummary {
  /** Start/end for an "add to calendar" file; activities only. */
  calendar?: { end: string; start: string };
  description?: string;
  /** Ordered for the sticky fact card; empty values already removed. */
  facts: PlaceFact[];
  images: PlaceImage[];
  position?: { lat: number; lng: number };
  reservationUrl?: string;
  /** Long-form sections after the description, in reading order. */
  sections: PlaceSection[];
  status?: { label: string; tone: PlaceStatusTone };
  /** ISO date-time of the source update. */
  updatedAt?: string;
  websiteUrl?: string;
}

export type ActivityWhen = 'ongoing' | 'upcoming';

export interface PlaceQuery {
  city?: City;
  /** Activities only: keep free events. */
  free?: boolean;
  keyword?: string;
  /** 1-based. */
  page?: number;
  pageSize?: number;
  /** A tag value from getTagOptions(type). */
  tag?: string;
  type: PlaceType;
  /** Activities only; omitted means ongoing and upcoming together. */
  when?: ActivityWhen;
}

export interface PlacePage {
  hasMore: boolean;
  items: PlaceSummary[];
  /** 1-based. */
  page: number;
}

export interface TagOption {
  label: string;
  value: string;
}
