/// <reference types="bun" />

import { describe, expect, test } from 'bun:test';

import { buildHref, parseCity, parseKeyword } from './search-params';

describe('search params', () => {
  test('parseKeyword trims, caps and drops blanks', () => {
    expect(parseKeyword(' 夜市 ')).toBe('夜市');
    expect(parseKeyword('   ')).toBeUndefined();
    expect(parseKeyword(['a', 'b'])).toBe('a');
    expect(parseKeyword('x'.repeat(80))).toHaveLength(50);
  });

  test('parseCity keeps only known city slugs', () => {
    expect(parseCity('Taipei')).toBe('Taipei');
    expect(parseCity(['Tainan', 'Taipei'])).toBe('Tainan');
    expect(parseCity('all')).toBeUndefined();
    expect(parseCity('Mars')).toBeUndefined();
    expect(parseCity(undefined)).toBeUndefined();
  });

  test('buildHref skips empty values and encodes', () => {
    expect(buildHref('/search', { city: undefined, q: '台北 101' })).toBe(
      '/search?q=%E5%8F%B0%E5%8C%97+101',
    );
    expect(buildHref('/search', {})).toBe('/search');
  });
});
