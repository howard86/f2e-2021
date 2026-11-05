import { type City, CityMap } from '@f2e/tdx-core';
import type { Metadata } from 'next';

import { ALL_CITIES } from '@/constants/preferences';
import {
  type EventsWhen,
  eventsPath,
  listPath,
  type PathCity,
} from '@/lib/list-paths';
import { backgroundImage, OPEN_GRAPH_BASE, TWITTER_BASE } from '@/lib/seo';
import { PLACE_LABEL, type PlaceType } from '@/types/place';

const WHEN_LABEL: Record<EventsWhen, string> = {
  free: '免費',
  ongoing: '進行中',
  upcoming: '即將開始',
};

const IMAGE_NAME: Record<PlaceType, string> = {
  activity: 'events',
  hotel: 'hotels',
  restaurant: 'restaurants',
  scene: 'scenes',
};

const cityName = (city: PathCity | undefined) =>
  city && city !== ALL_CITIES ? CityMap[city as City] : undefined;

interface ListMetadataInput {
  city?: PathCity;
  page: number;
  /** Label of the selected tag, e.g. 自然風景類. */
  tagLabel?: string;
  type: PlaceType;
  when?: EventsWhen;
}

export const buildListTitle = ({
  city,
  page,
  tagLabel,
  type,
  when,
}: ListMetadataInput) => {
  const place = cityName(city);
  // Plain /events already means ongoing, so only name `when` once narrowed.
  const whenLabel =
    when && (when !== 'ongoing' || place) ? WHEN_LABEL[when] : '';
  const subject = `${tagLabel ?? ''}${whenLabel}${PLACE_LABEL[type]}`;
  const title = [place, subject].filter(Boolean).join(' · ');

  return page > 1 ? `${title} · 第 ${page} 頁` : title;
};

const buildListDescription = ({
  city,
  tagLabel,
  type,
  when,
}: ListMetadataInput) => {
  const place = cityName(city) ?? '全台';
  const label = PLACE_LABEL[type];
  const subject = `${tagLabel ?? ''}${label}`;

  if (type === 'activity') {
    const whenLabel = when ? WHEN_LABEL[when] : WHEN_LABEL.ongoing;

    return `瀏覽${place}${whenLabel}的活動、節慶與展覽。`;
  }

  if (type === 'restaurant') {
    return `瀏覽${place}的${subject}，找到在地美食。`;
  }

  if (type === 'hotel') {
    return `瀏覽${place}的${subject}，比較住宿選擇。`;
  }

  return `瀏覽${place}的${subject}，規劃你的下一趟旅程。`;
};

export const buildListCanonical = ({
  city,
  page,
  type,
  when,
  tag,
}: ListMetadataInput & { tag?: string }) => {
  // `/scenes/all` renders the same list as `/scenes`; point it at the shorter URL.
  const path = city === ALL_CITIES && !tag && page === 1 ? undefined : city;

  return type === 'activity'
    ? eventsPath({ city: path, page, when })
    : listPath({ city: path, page, tag, type });
};

export const buildListMetadata = (
  input: ListMetadataInput & { tag?: string },
): Metadata => {
  const title = buildListTitle(input);
  const description = buildListDescription(input);

  return {
    alternates: { canonical: buildListCanonical(input) },
    description,
    openGraph: {
      ...OPEN_GRAPH_BASE,
      description,
      images: [backgroundImage(IMAGE_NAME[input.type], title)],
      title,
    },
    title,
    twitter: { ...TWITTER_BASE, description, title },
  };
};
