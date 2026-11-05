import { afterEach, describe, expect, test } from 'bun:test';

import { TdxService } from '@f2e/tdx-core';
import attractions from './fixtures/attractions.json';
import events from './fixtures/events.json';
import hotels from './fixtures/hotels.json';
import {
  ATTRACTION_CLASSES,
  EVENT_CLASSES,
  HOTEL_STARS,
  labelOf,
  labelsOf,
  splitTrafficInfo,
  TourismService,
} from './index';

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

const mockTdx = (rows: unknown[]) => {
  const urls: string[] = [];

  globalThis.fetch = ((input: Request | string | URL) => {
    const url = input instanceof Request ? input.url : String(input);

    if (url.includes('/token')) {
      return Promise.resolve(
        Response.json({ access_token: 'token', expires_in: 3600 }),
      );
    }

    urls.push(url);

    return Promise.resolve(Response.json({ value: rows }));
  }) as unknown as typeof fetch;

  const service = new TourismService(
    new TdxService({
      baseUrl: 'https://tdx.test',
      clientId: 'id',
      clientSecret: 'secret',
    }),
  );

  return { service, urls };
};

describe('code labels', () => {
  test('known codes resolve to the V2.1 standard names', () => {
    expect(labelOf(ATTRACTION_CLASSES, 11)).toBe('自然風景類');
    expect(labelOf(EVENT_CLASSES, 201)).toBe('音樂');
    expect(HOTEL_STARS[6]).toBe('卓越5星級');
  });

  test('unknown and reserved codes yield no label', () => {
    expect(labelOf(ATTRACTION_CLASSES, 99)).toBeUndefined();
    expect(labelsOf(ATTRACTION_CLASSES, [11, 99, 11, 2])).toEqual([
      '自然風景類',
      '生態類',
    ]);
    expect(labelsOf(ATTRACTION_CLASSES, undefined)).toEqual([]);
  });
});

describe('splitTrafficInfo', () => {
  test('splits on ［…］ markers and merges runs under one heading', () => {
    expect(
      splitTrafficInfo(
        '［開車前往］路線一：A。［開車前往］路線二：B。［大眾運輸］搭客運。',
      ),
    ).toEqual([
      { heading: '開車前往', text: '路線一：A。\n路線二：B。' },
      { heading: '大眾運輸', text: '搭客運。' },
    ]);
  });

  test('keeps leading text as a heading-less step', () => {
    expect(splitTrafficInfo('國道3號下交流道。［大眾運輸］客運')).toEqual([
      { text: '國道3號下交流道。' },
      { heading: '大眾運輸', text: '客運' },
    ]);
  });

  test('returns undefined without markers or text', () => {
    expect(splitTrafficInfo('台北出發，約2小時 [506]')).toBeUndefined();
    expect(splitTrafficInfo('  ')).toBeUndefined();
    expect(splitTrafficInfo(null)).toBeUndefined();
  });

  test('splits a real fixture', () => {
    const steps = splitTrafficInfo(attractions.value[0].TrafficInfo);

    expect(steps?.[0].heading).toBe('開車前往');
  });
});

describe('native V2 getters', () => {
  test('sends filter, order, paging and city and reports the raw row count', async () => {
    const { service, urls } = mockTdx([
      ...events.value,
      { EventID: 'bad', EventName: '' },
    ]);
    const result = await service.getEventsV2(
      {
        filter: 'EndDateTime ge 2026-11-05',
        orderBy: 'StartDateTime asc',
        skip: 12,
        top: 13,
      },
      'Taipei',
    );
    const query = new URL(urls[0]).searchParams;

    expect(query.get('$filter')).toBe(
      "(EndDateTime ge 2026-11-05) and PostalAddress/City eq '臺北市'",
    );
    expect(query.get('$orderby')).toBe('StartDateTime asc');
    expect(query.get('$top')).toBe('13');
    expect(query.get('$skip')).toBe('12');
    expect(result.fetched).toBe(events.value.length + 1);
    expect(result.items).toHaveLength(events.value.length);
  });

  test('keeps every V2 field the V1 mapping dropped', async () => {
    const { service } = mockTdx(hotels.value);
    const { items } = await service.getHotelsV2({ top: 20 });

    expect(items[0].LowestPrice).toBe(30_954);
    expect(items[0].PostalAddress.Town).toBe('魚池鄉');
    expect(items[0].HotelStars).toBe(5);
  });

  test('looks a record up by id and escapes quotes', async () => {
    const { service, urls } = mockTdx(attractions.value.slice(0, 1));
    const item = await service.getAttractionByIdV2("a'b");

    expect(new URL(urls[0]).searchParams.get('$filter')).toBe(
      "AttractionID eq 'a''b'",
    );
    expect(item?.AttractionID).toBe(attractions.value[0].AttractionID);
  });

  test('returns null when nothing matches', async () => {
    const { service } = mockTdx([]);

    expect(await service.getHotelByIdV2('missing')).toBeNull();
  });
});
