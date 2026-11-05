/// <reference types="bun" />

import { describe, expect, test } from 'bun:test';

import {
  decodeSegments,
  eventsPath,
  listPath,
  parseEventsPath,
  parseListPath,
} from './list-paths';

const TAGS = ['1', '12', 'star:5'];

describe('listPath', () => {
  test('builds canonical paths and omits page 1', () => {
    expect(listPath({ type: 'scene' })).toBe('/scenes');
    expect(listPath({ city: 'Taipei', type: 'scene' })).toBe('/scenes/Taipei');
    expect(listPath({ city: 'all', type: 'hotel' })).toBe('/hotels/all');
    expect(listPath({ city: 'Taipei', page: 1, type: 'scene' })).toBe(
      '/scenes/Taipei',
    );
    expect(listPath({ city: 'Taipei', page: 3, type: 'restaurant' })).toBe(
      '/restaurants/Taipei/page/3',
    );
  });

  test('uses all when a tag or page has no city', () => {
    expect(listPath({ tag: '12', type: 'scene' })).toBe('/scenes/all/12');
    expect(listPath({ page: 2, type: 'scene' })).toBe('/scenes/all/page/2');
  });

  test('encodes tags', () => {
    expect(listPath({ city: 'all', tag: 'star:5', type: 'hotel' })).toBe(
      '/hotels/all/star%3A5',
    );
    expect(
      listPath({ city: 'Tainan', page: 2, tag: 'star:5', type: 'hotel' }),
    ).toBe('/hotels/Tainan/star%3A5/page/2');
  });

  test('activity delegates to events', () => {
    expect(listPath({ city: 'Taipei', type: 'activity' })).toBe(
      '/events/ongoing/Taipei',
    );
  });
});

describe('parseListPath', () => {
  test('round-trips', () => {
    expect(parseListPath(undefined, TAGS)).toEqual({ page: 1 });
    expect(parseListPath([], TAGS)).toEqual({ page: 1 });
    expect(parseListPath(['Taipei'], TAGS)).toEqual({
      city: 'Taipei',
      page: 1,
      tag: undefined,
    });
    expect(parseListPath(['all', '12'], TAGS)).toEqual({
      city: 'all',
      page: 1,
      tag: '12',
    });
    expect(parseListPath(['Taipei', 'page', '2'], TAGS)).toEqual({
      city: 'Taipei',
      page: 2,
      tag: undefined,
    });
    expect(parseListPath(['Taipei', 'star:5', 'page', '4'], TAGS)).toEqual({
      city: 'Taipei',
      page: 4,
      tag: 'star:5',
    });
  });

  test('rejects invalid input', () => {
    const bad = [
      ['Nowhere'],
      ['Taipei', 'zzz'],
      ['Taipei', 'page', '1'],
      ['Taipei', 'page', '0'],
      ['Taipei', 'page', '501'],
      ['Taipei', 'page', '2x'],
      ['Taipei', 'page'],
      ['Taipei', '12', 'page'],
      ['Taipei', '12', 'page', '1'],
      ['Taipei', '12', 'page', '2', 'extra'],
      ['Taipei', '12', '1'],
    ];

    for (const segments of bad) {
      expect(parseListPath(segments, TAGS)).toBeNull();
    }
  });

  test('parses what listPath builds', () => {
    const path = listPath({
      city: 'Tainan',
      page: 2,
      tag: 'star:5',
      type: 'hotel',
    });
    const segments = decodeSegments(path.split('/').slice(2));

    expect(parseListPath(segments, TAGS)).toEqual({
      city: 'Tainan',
      page: 2,
      tag: 'star:5',
    });
  });
});

describe('eventsPath', () => {
  test('builds canonical paths', () => {
    expect(eventsPath({})).toBe('/events');
    expect(eventsPath({ when: 'ongoing' })).toBe('/events');
    expect(eventsPath({ when: 'upcoming' })).toBe('/events/upcoming');
    expect(eventsPath({ city: 'Taipei' })).toBe('/events/ongoing/Taipei');
    expect(eventsPath({ city: 'all', when: 'free' })).toBe('/events/free/all');
    expect(eventsPath({ city: 'Taipei', page: 2, when: 'upcoming' })).toBe(
      '/events/upcoming/Taipei/page/2',
    );
    expect(eventsPath({ page: 2, when: 'free' })).toBe(
      '/events/free/all/page/2',
    );
    expect(eventsPath({ city: 'Taipei', page: 1, when: 'free' })).toBe(
      '/events/free/Taipei',
    );
  });
});

describe('parseEventsPath', () => {
  test('round-trips', () => {
    expect(parseEventsPath(undefined)).toEqual({ page: 1, when: 'ongoing' });
    expect(parseEventsPath(['free'])).toEqual({ page: 1, when: 'free' });
    expect(parseEventsPath(['upcoming', 'Taipei'])).toEqual({
      city: 'Taipei',
      page: 1,
      when: 'upcoming',
    });
    expect(parseEventsPath(['ongoing', 'all', 'page', '3'])).toEqual({
      city: 'all',
      page: 3,
      when: 'ongoing',
    });
  });

  test('rejects invalid input', () => {
    const bad = [
      ['soon'],
      ['Taipei'],
      ['ongoing', 'Nowhere'],
      ['ongoing', 'Taipei', 'page'],
      ['ongoing', 'page', '2'],
      ['ongoing', 'Taipei', 'page', '1'],
      ['ongoing', 'Taipei', 'page', '0'],
      ['ongoing', 'Taipei', 'page', '2', 'x'],
      ['ongoing', 'Taipei', 'x', '2'],
    ];

    for (const segments of bad) {
      expect(parseEventsPath(segments)).toBeNull();
    }
  });
});

describe('decodeSegments', () => {
  test('decodes and tolerates malformed escapes', () => {
    expect(decodeSegments(['star%3A5', '%E0%A4%A'])).toEqual([
      'star:5',
      '%E0%A4%A',
    ]);
    expect(decodeSegments(undefined)).toBeUndefined();
  });
});
