/// <reference types="bun" />

import { describe, expect, test } from 'bun:test';

import { buildHref, parseListParams, toQueryRecord } from './search-params';

describe('parseListParams', () => {
  test('defaults', () => {
    expect(parseListParams({})).toEqual({
      city: undefined,
      free: undefined,
      page: 1,
      q: undefined,
      tag: undefined,
      when: undefined,
    });
  });

  test('keeps valid values', () => {
    const params = parseListParams(
      { city: 'Taipei', page: '3', q: ' 夜市 ', tag: 'a', when: 'upcoming' },
      ['a', 'b'],
    );

    expect(params).toMatchObject({
      city: 'Taipei',
      page: 3,
      q: '夜市',
      tag: 'a',
      when: 'upcoming',
    });
  });

  test('ignores invalid values', () => {
    const params = parseListParams(
      { city: 'Mars', free: '0', page: '-2', q: '   ', tag: 'zzz', when: 'x' },
      ['a'],
    );

    expect(params).toEqual({
      city: undefined,
      free: undefined,
      page: 1,
      q: undefined,
      tag: undefined,
      when: undefined,
    });
  });

  test('takes the first of repeated params and caps pages', () => {
    expect(parseListParams({ page: ['2', '5'] }).page).toBe(2);
    expect(parseListParams({ page: '99999' }).page).toBe(1);
    expect(parseListParams({ page: '1.5' }).page).toBe(1);
  });

  test('free=1 enables the free filter', () => {
    expect(parseListParams({ free: '1' }).free).toBe(true);
  });
});

describe('query helpers', () => {
  test('toQueryRecord drops page and stringifies free', () => {
    expect(toQueryRecord({ city: 'Tainan', free: true })).toEqual({
      city: 'Tainan',
      free: '1',
      q: undefined,
      tag: undefined,
      when: undefined,
    });
  });

  test('buildHref skips empty values and encodes', () => {
    expect(buildHref('/scenes', { city: undefined, q: '台北 101' })).toBe(
      '/scenes?q=%E5%8F%B0%E5%8C%97+101',
    );
    expect(buildHref('/scenes', {})).toBe('/scenes');
  });
});
