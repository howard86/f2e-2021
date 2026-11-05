/// <reference types="bun" />

import { describe, expect, test } from 'bun:test';
import attractions from '../../../../libs/tdx-tourism/fixtures/attractions.json';
import events from '../../../../libs/tdx-tourism/fixtures/events.json';
import hotels from '../../../../libs/tdx-tourism/fixtures/hotels.json';
import restaurants from '../../../../libs/tdx-tourism/fixtures/restaurants.json';
import { parseTourismItems } from '../../../../libs/tdx-tourism/schemas';

import type { PlaceRecord } from './place-mappers';
import { toSummary } from './place-mappers';
import { matchesTag } from './place-queries';
import {
  collectSnapshot,
  filterRecords,
  fitSnapshot,
  matchesKeyword,
  nearbyFrom,
  pageRecords,
  SNAPSHOT_MAX_BYTES,
  SNAPSHOT_MAX_PAGES,
  SNAPSHOT_PAGE_SIZE,
  searchRecords,
  snapshotBytes,
  sortRecords,
  trimRecord,
} from './place-snapshot';

const valid = (
  type: Parameters<typeof parseTourismItems>[0],
  rows: unknown[],
) => parseTourismItems(type, rows).valid as unknown as PlaceRecord[];

const HEAVY = /Description|TrafficInfo|RoomInfo/u;
const scenes = valid('ScenicSpot', attractions.value);
const places = valid('Hotel', hotels.value);
const eats = valid('Restaurant', restaurants.value);
const activities = valid('Activity', events.value);

const withEvent = (
  base: PlaceRecord,
  id: string,
  start: string,
  end: string,
  free = 0,
) =>
  ({
    ...base,
    EndDateTime: end,
    EventID: id,
    EventName: id,
    IsAccessibleForFree: free,
    StartDateTime: start,
  }) as unknown as PlaceRecord;

describe('trimRecord', () => {
  test('summary is unchanged and only the first image stays', () => {
    for (const [type, rows] of [
      ['scene', scenes],
      ['hotel', places],
      ['restaurant', eats],
      ['activity', activities],
    ] as const) {
      for (const record of rows) {
        const trimmed = trimRecord(type, record);

        expect(toSummary(type, trimmed)).toEqual(toSummary(type, record));
        expect((trimmed.Images ?? []).length).toBeLessThanOrEqual(1);
      }
    }
  });

  test('heavy fields are dropped', () => {
    const trimmed = trimRecord('scene', scenes[0]) as Record<string, unknown>;

    expect(Object.keys(trimmed).join()).not.toMatch(HEAVY);
  });
});

describe('collectSnapshot', () => {
  const page = (rows: number) => ({
    fetched: rows,
    items: scenes.slice(0, 1),
  });

  test('stops at the first short page', async () => {
    const calls: number[][] = [];
    const records = await collectSnapshot('scene', (top, skip) => {
      calls.push([top, skip]);
      return Promise.resolve(page(calls.length === 2 ? 3 : top));
    });

    expect(calls).toEqual([
      [SNAPSHOT_PAGE_SIZE, 0],
      [SNAPSHOT_PAGE_SIZE, SNAPSHOT_PAGE_SIZE],
    ]);
    expect(records).toHaveLength(2);
  });

  test('respects the page cap and warns', async () => {
    const warnings: string[] = [];
    let calls = 0;

    await collectSnapshot(
      'scene',
      (top) => {
        calls += 1;
        return Promise.resolve(page(top));
      },
      (message) => warnings.push(message),
    );

    expect(calls).toBe(SNAPSHOT_MAX_PAGES);
    expect(warnings).toHaveLength(1);
  });

  test('a failing page rejects', async () => {
    await expect(
      collectSnapshot('scene', () => Promise.reject(new Error('429'))),
    ).rejects.toThrow('429');
  });
});

describe('local list', () => {
  const [base] = activities;
  const now = new Date('2026-11-05T12:00:00+08:00');
  const rows = [
    withEvent(
      base,
      'past',
      '2026-10-01T00:00:00+08:00',
      '2026-11-05T09:00:00+08:00',
    ),
    withEvent(
      base,
      'later',
      '2026-12-01T00:00:00+08:00',
      '2026-12-02T00:00:00+08:00',
      1,
    ),
    withEvent(
      base,
      'now-b',
      '2026-11-01T00:00:00+08:00',
      '2026-11-30T00:00:00+08:00',
    ),
    withEvent(
      base,
      'now-a',
      '2026-11-02T00:00:00+08:00',
      '2026-11-10T00:00:00+08:00',
      1,
    ),
  ];
  const ids = (list: PlaceRecord[]) =>
    list.map((r) => (r as unknown as { EventID: string }).EventID);

  test('when uses exact times', () => {
    expect(
      ids(filterRecords({ type: 'activity', when: 'ongoing' }, rows, now)),
    ).toEqual(['now-b', 'now-a']);
    expect(
      ids(filterRecords({ type: 'activity', when: 'upcoming' }, rows, now)),
    ).toEqual(['later']);
    expect(ids(filterRecords({ type: 'activity' }, rows, now))).toEqual([
      'later',
      'now-b',
      'now-a',
    ]);
  });

  test('free keeps free events only', () => {
    expect(
      ids(filterRecords({ free: true, type: 'activity' }, rows, now)),
    ).toEqual(['later', 'now-a']);
  });

  test('sorts like orderByFor', () => {
    expect(ids(sortRecords('activity', rows, 'ongoing'))).toEqual([
      'past',
      'now-a',
      'now-b',
      'later',
    ]);
    expect(ids(sortRecords('activity', rows))).toEqual([
      'past',
      'now-b',
      'now-a',
      'later',
    ]);

    const newer = {
      ...scenes[0],
      UpdateTime: '2999-01-01T00:00:00+08:00',
    } as PlaceRecord;

    expect(sortRecords('scene', [scenes[0], newer])[0]).toBe(newer);
  });

  test('pages locally with hasMore from the filtered length', () => {
    const list = [1, 2, 3, 4, 5];

    expect(pageRecords(list, 1, 2)).toEqual({ hasMore: true, rows: [1, 2] });
    expect(pageRecords(list, 3, 2)).toEqual({ hasMore: false, rows: [5] });
    expect(pageRecords(list, 4, 2)).toEqual({ hasMore: false, rows: [] });
  });
});

describe('local tags', () => {
  test('class codes, event parent classes and hotel stars', () => {
    const scene = { AttractionClasses: [11, 12] };
    const event = { EventClasses: [205] };
    const hotel = { HotelStars: 5 };

    expect(matchesTag('scene', scene, '11')).toBe(true);
    expect(matchesTag('scene', scene, '1')).toBe(false);
    expect(matchesTag('activity', event, '2')).toBe(true);
    expect(matchesTag('activity', event, '1')).toBe(false);
    expect(matchesTag('hotel', hotel, 'star:5')).toBe(true);
    expect(matchesTag('hotel', hotel, 'star:4')).toBe(false);
    expect(matchesTag('scene', scene, '999')).toBe(true);
    expect(matchesTag('scene', scene, undefined)).toBe(true);
  });
});

describe('local search and nearby', () => {
  test('keyword matches name, town and tags case-insensitively', () => {
    const summary = toSummary('scene', scenes[0]);

    expect(matchesKeyword(summary, summary.name.toUpperCase())).toBe(true);
    expect(matchesKeyword(summary, summary.town ?? 'zzz-none')).toBe(true);
    expect(matchesKeyword(summary, 'definitely-not-here')).toBe(false);
    expect(searchRecords('scene', scenes, summary.name, 1)).toHaveLength(1);
  });

  test('nearby stays in the town, excludes the origin, nearest first', () => {
    const [first] = scenes;
    const origin = toSummary('scene', first);
    const lat = Number(first.PositionLat);
    const lon = Number(first.PositionLon);
    const make = (id: string, dLat: number, town = origin.town) =>
      ({
        ...first,
        AttractionID: id,
        AttractionName: id,
        PositionLat: lat + dLat,
        PositionLon: lon,
        PostalAddress: { ...first.PostalAddress, Town: town },
      }) as unknown as PlaceRecord;
    const records = [
      first,
      make('far', 0.2),
      make('near', 0.01),
      make('other', 0.001, 'elsewhere'),
    ];
    const result = nearbyFrom(
      { ...origin, position: { lat, lng: lon } },
      [{ records, type: 'scene' }],
      6,
    );

    expect(result.map((p) => p.id)).toEqual(['near', 'far']);
  });

  test('nearby without a town dedupes by type and name, keeping the first', () => {
    const [first] = scenes;
    const make = (id: string, name: string, dLat: number) =>
      ({
        ...first,
        AttractionID: id,
        AttractionName: name,
        PositionLat: Number(first.PositionLat) + dLat,
        PositionLon: Number(first.PositionLon),
      }) as unknown as PlaceRecord;
    const records = [
      make('a', 'dup', 0.3),
      make('b', 'dup', 0.01),
      make('c', 'solo', 0.1),
    ];
    const origin = {
      id: 'origin',
      name: 'origin',
      position: {
        lat: Number(first.PositionLat),
        lng: Number(first.PositionLon),
      },
      type: 'scene' as const,
    };

    expect(
      nearbyFrom(origin, [{ records, type: 'scene' }], 6).map((p) => p.id),
    ).toEqual(['c', 'a']);
  });

  test('searchRecords keeps record order and stops at the limit', () => {
    const reference = scenes
      .map((record) => toSummary('scene', record))
      .filter((summary) => matchesKeyword(summary, '市'))
      .slice(0, 3);

    expect(searchRecords('scene', scenes, '市', 3)).toEqual(reference);
  });
});

describe('fitSnapshot', () => {
  const bulky = (count: number) =>
    Array.from(
      { length: count },
      (_, index) =>
        ({
          ...trimRecord('scene', scenes[0]),
          AttractionID: `A${index}`,
          FeeInfo: 'x'.repeat(41),
          Images: [{ URL: `https://example.com/${'p'.repeat(400)}.jpg` }],
        }) as unknown as PlaceRecord,
    );

  test('returns a snapshot under the limit untouched, without warning', () => {
    const rows = bulky(3);
    const warnings: string[] = [];

    expect(fitSnapshot('scene/Taipei', rows, (m) => warnings.push(m))).toBe(
      rows,
    );
    expect(warnings).toEqual([]);
  });

  test('drops images, then records, until the entry fits, and warns', () => {
    const rows = bulky(6000);
    const warnings: string[] = [];
    const fitted = fitSnapshot('scene/Taipei', rows, (m) => warnings.push(m));

    expect(snapshotBytes(rows)).toBeGreaterThan(SNAPSHOT_MAX_BYTES);
    expect(snapshotBytes(fitted)).toBeLessThanOrEqual(SNAPSHOT_MAX_BYTES);
    expect(JSON.stringify(fitted[0])).not.toContain('Images');
    expect(warnings).toHaveLength(1);
  });
});
