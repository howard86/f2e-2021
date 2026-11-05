/// <reference types="bun" />

import { describe, expect, test } from 'bun:test';
import attractions from '../../../../libs/tdx-tourism/fixtures/attractions.json';
import events from '../../../../libs/tdx-tourism/fixtures/events.json';
import hotels from '../../../../libs/tdx-tourism/fixtures/hotels.json';
import restaurants from '../../../../libs/tdx-tourism/fixtures/restaurants.json';
import { parseTourismItems } from '../../../../libs/tdx-tourism/schemas';

import {
  formatPriceRange,
  formatRoomInfo,
  mergeTags,
  type PlaceRecord,
  statusOf,
  toDetail,
  toSummary,
} from './place-mappers';
import {
  buildListRequest,
  getTagOptionsFor,
  hasMoreRows,
  tagFilter,
} from './place-queries';

const valid = (
  type: Parameters<typeof parseTourismItems>[0],
  rows: unknown[],
) => parseTourismItems(type, rows).valid as unknown as PlaceRecord[];

const DIGITS = /^\d+$/u;
const SCENE_HREF = /^\/[A-Za-z]+\/scene\//u;

const [scene] = valid('ScenicSpot', attractions.value);
const [restaurant] = valid('Restaurant', restaurants.value);
const [hotel] = valid('Hotel', hotels.value);
const [event] = valid('Activity', events.value);

describe('toSummary / toDetail', () => {
  test('scene: class labels precede tags, deduped and capped at 6', () => {
    const summary = toSummary('scene', scene);

    expect(summary.tags.length).toBeLessThanOrEqual(6);
    expect(new Set(summary.tags).size).toBe(summary.tags.length);
    expect(summary.tags[0]).not.toMatch(DIGITS);
    expect(summary.href).toMatch(SCENE_HREF);
    expect(summary.image?.url).toStartWith('http');
  });

  test('hotel: price range key fact, stars, town and ordered facts', () => {
    const summary = toSummary('hotel', hotel);
    const detail = toDetail('hotel', hotel);

    expect(summary.keyFact).toBe('NT$ 30,954 – NT$ 297,990');
    expect(summary.town).toBe('魚池鄉');
    expect(detail.facts.map((f) => f.key)).toEqual(
      expect.arrayContaining(['address', 'phone', 'price', 'rooms', 'stars']),
    );
    expect(detail.facts[0].key).toBe('address');
    expect(detail.facts[0].kind).toBe('map');
    expect(detail.facts.find((f) => f.key === 'phone')?.href).toStartWith(
      'tel:',
    );
    expect(detail.facts.find((f) => f.key === 'stars')?.value).toContain('★');
    expect(detail.images.length).toBeGreaterThan(3);
    expect(detail.facts.every((f) => f.value)).toBe(true);
  });

  test('activity: zh-TW date range, calendar and date-derived status', () => {
    const summary = toSummary('activity', event);

    expect(summary.keyFact).toBe('2026/12/31 – 2027/1/1');
    expect(toDetail('activity', event).calendar).toEqual({
      end: '2027-01-01T01:00:00+08:00',
      start: '2026-12-31T19:00:00+08:00',
    });
    expect(statusOf('activity', event, new Date('2026-11-05'))?.label).toBe(
      '尚未開始',
    );
    expect(
      statusOf('activity', event, new Date('2026-12-31T20:00:00+08:00'))?.label,
    ).toBe('進行中');
    expect(statusOf('activity', event, new Date('2027-02-01'))?.label).toBe(
      '已結束',
    );
  });

  test('restaurant: key fact is the service time', () => {
    expect(toSummary('restaurant', restaurant).keyFact).toBe(
      (restaurant as { ServiceTimeInfo?: string }).ServiceTimeInfo,
    );
  });

  test('traffic info becomes steps with headings; empty sections are dropped', () => {
    const { sections } = toDetail('scene', scene);
    const traffic = sections.find((s) => s.key === 'traffic');

    expect(traffic?.steps?.[0].heading).toBe('開車前往');
    expect(sections.every((s) => s.body)).toBe(true);
  });

  test('helpers', () => {
    expect(formatPriceRange(1000, undefined)).toBe('NT$ 1,000 起');
    expect(formatPriceRange(0, 0)).toBeUndefined();
    expect(formatRoomInfo('雙人房3000;套房5000;雙人房3000')).toBe(
      '雙人房　NT$ 3,000\n套房　NT$ 5,000',
    );
    expect(formatRoomInfo('雙人房 含早餐')).toBe('雙人房 含早餐');
    expect(mergeTags(['a', 'b'], ['b', 'c', 'd', 'e', 'f', 'g'])).toEqual([
      'a',
      'b',
      'c',
      'd',
      'e',
      'f',
    ]);
  });
});

describe('list requests', () => {
  const now = new Date('2026-11-05T10:00:00+08:00');

  test('fetches pageSize + 1 rows with skip for the page', () => {
    const request = buildListRequest(
      { page: 3, pageSize: 12, type: 'scene' },
      now,
    );

    expect(request?.params).toMatchObject({ skip: 24, top: 13 });
    expect(request?.params.orderBy).toBe('UpdateTime desc,AttractionID asc');
  });

  test('hasMore comes from the raw row count, not the valid count', () => {
    expect(hasMoreRows(13, 12)).toBe(true);
    expect(hasMoreRows(12, 12)).toBe(false);
  });

  test('activities default to ongoing + upcoming, oldest start first', () => {
    const request = buildListRequest({ type: 'activity' }, now);

    expect(request?.params.filter).toBe('EndDateTime ge 2026-11-05');
    expect(request?.params.orderBy).toBe('StartDateTime asc,EventID asc');
  });

  test('when and free narrow activities', () => {
    expect(
      buildListRequest({ type: 'activity', when: 'ongoing' }, now)?.params
        .filter,
    ).toBe('StartDateTime lt 2026-11-06 and EndDateTime ge 2026-11-05');
    expect(
      buildListRequest({ type: 'activity', when: 'upcoming' }, now)?.params
        .filter,
    ).toBe('StartDateTime ge 2026-11-06');
    expect(
      buildListRequest({ free: true, type: 'activity' }, now)?.params.filter,
    ).toContain('IsAccessibleForFree eq 1');
  });

  test('tags come from the code tables; unknown tags are ignored', () => {
    expect(tagFilter('scene', '11')).toBe('AttractionClasses/any(c: c eq 11)');
    expect(tagFilter('hotel', 'star:5')).toBe('HotelStars eq 5');
    expect(tagFilter('activity', '2')).toContain('c eq 215)');
    expect(tagFilter('activity', '2')).not.toContain(' ge ');
    expect(tagFilter('scene', '999')).toBeUndefined();
    expect(tagFilter('scene', "1' or 1 eq 1")).toBeUndefined();
    expect(getTagOptionsFor('scene')[0]).toEqual({
      label: '文化類',
      value: '1',
    });
  });

  test('keyword is escaped; unknown city or type is not found', () => {
    expect(
      buildListRequest({ keyword: "a'b", type: 'scene' }, now)?.params.filter,
    ).toContain("'a''b'");
    expect(
      buildListRequest({ city: 'Nowhere' as never, type: 'scene' }, now),
    ).toBeUndefined();
    expect(buildListRequest({ type: 'x' as never }, now)).toBeUndefined();
  });
});
