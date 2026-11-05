import { describe, expect, test } from 'bun:test';

import attractions from './fixtures/attractions.json';
import events from './fixtures/events.json';
import hotels from './fixtures/hotels.json';
import restaurants from './fixtures/restaurants.json';
import { parseTourismItems } from './schemas';

const [attraction] = attractions.value;
const [event] = events.value;

describe('parseTourismItems', () => {
  test.each([
    ['ScenicSpot', attractions.value],
    ['Restaurant', restaurants.value],
    ['Hotel', hotels.value],
    ['Activity', events.value],
  ] as const)('accepts every %s fixture', (type, items) => {
    const { skipped, valid } = parseTourismItems(type, items);

    expect(skipped).toEqual([]);
    expect(valid).toHaveLength(items.length);
  });

  test('skips items missing a name and reports their id', () => {
    const { skipped, valid } = parseTourismItems('ScenicSpot', [
      attraction,
      { ...attraction, AttractionName: '  ' },
    ]);

    expect(valid).toHaveLength(1);
    expect(skipped).toEqual([
      {
        id: attraction.AttractionID,
        reason: expect.stringContaining('AttractionName'),
      },
    ]);
  });

  test('skips items whose city does not resolve', () => {
    const { skipped } = parseTourismItems('ScenicSpot', [
      {
        ...attraction,
        LocatedCities: [],
        PostalAddress: { ...attraction.PostalAddress, City: '火星市' },
      },
    ]);

    expect(skipped[0]?.reason).toContain('unknown city: 火星市');
  });

  test('normalises 台 to 臺 and falls back to LocatedCities', () => {
    const { valid } = parseTourismItems('ScenicSpot', [
      { ...attraction, PostalAddress: { City: '台中市' } },
      {
        ...attraction,
        LocatedCities: [{ City: '台東縣' }],
        PostalAddress: null,
      },
    ]);

    expect(
      valid.map(
        (item) => (item.PostalAddress as { City: string } | undefined)?.City,
      ),
    ).toEqual(['臺中市', '臺東縣']);
  });

  test('drops malformed optional fields but keeps the item', () => {
    const { skipped, valid } = parseTourismItems('ScenicSpot', [
      {
        ...attraction,
        Images: [
          { URL: 'not a url' },
          { Name: null, URL: 'https://a.tw/1.jpg' },
        ],
        PositionLat: 'north',
        Tags: ['', '夜景', 3],
        Telephones: [{ Tel: null }, { Ext: null, Tel: '(02)1234' }],
        WebsiteUrl: 'javascript:alert(1)',
      },
    ]);

    expect(skipped).toEqual([]);
    expect(valid[0]).toMatchObject({
      Images: [{ Name: undefined, URL: 'https://a.tw/1.jpg' }],
      PositionLat: undefined,
      Tags: ['夜景'],
      Telephones: [{ Ext: undefined, Tel: '(02)1234' }],
      WebsiteUrl: undefined,
    });
  });

  test('skips events without valid, ordered dates', () => {
    const { skipped, valid } = parseTourismItems('Activity', [
      { ...event, StartDateTime: null },
      { ...event, EndDateTime: 'soon' },
      {
        ...event,
        EndDateTime: '2026-01-01T00:00:00+08:00',
        StartDateTime: '2026-02-01T00:00:00+08:00',
      },
    ]);

    expect(valid).toEqual([]);
    expect(skipped.map((item) => item.reason)).toEqual([
      expect.stringContaining('StartDateTime'),
      expect.stringContaining('EndDateTime'),
      expect.stringContaining('ends before it starts'),
    ]);
  });

  test('keeps fields outside the schema untouched', () => {
    const { valid } = parseTourismItems('Hotel', [hotels.value[0]]);

    expect(valid[0]?.LowestPrice).toEqual(hotels.value[0]?.LowestPrice);
  });
});
