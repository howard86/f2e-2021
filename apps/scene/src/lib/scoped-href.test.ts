/// <reference types="bun" />

import { describe, expect, test } from 'bun:test';

import { rescopedHref, scopedHref } from './scoped-href';

describe('scopedHref', () => {
  test('adds the city to bare list paths', () => {
    expect(scopedHref('/scenes', '', 'Taipei')).toBe('/scenes/Taipei');
    expect(scopedHref('/restaurants', '', 'Tainan')).toBe(
      '/restaurants/Tainan',
    );
    expect(scopedHref('/hotels', '', 'Taipei')).toBe('/hotels/Taipei');
  });

  test('scopes events with or without a when', () => {
    expect(scopedHref('/events', '', 'Taipei')).toBe('/events/ongoing/Taipei');
    expect(scopedHref('/events/upcoming', '', 'Taipei')).toBe(
      '/events/upcoming/Taipei',
    );
    expect(scopedHref('/events/free', '', 'Taipei')).toBe(
      '/events/free/Taipei',
    );
  });

  test('adds ?city to search only when absent', () => {
    expect(scopedHref('/search', 'q=abc', 'Taipei')).toBe(
      '/search?q=abc&city=Taipei',
    );
    expect(scopedHref('/search', '', 'Taipei')).toBe('/search?city=Taipei');
    expect(scopedHref('/search', 'q=abc&city=all', 'Taipei')).toBeUndefined();
  });

  test('never rewrites a path that names a city or all', () => {
    for (const path of [
      '/scenes/Tainan',
      '/scenes/all',
      '/scenes/all/12',
      '/scenes/Taipei/page/2',
      '/events/ongoing/all',
      '/events/upcoming/Tainan/page/2',
      '/Taipei',
      '/saved',
      '/',
    ]) {
      expect(scopedHref(path, '', 'Taipei')).toBeUndefined();
    }
  });
});

describe('rescopedHref', () => {
  test('swaps the city and drops the page', () => {
    expect(rescopedHref('/scenes/Taipei/page/2', '', 'Tainan')).toBe(
      '/scenes/Tainan',
    );
    expect(rescopedHref('/hotels/all/star%3A5', '', 'Tainan')).toBe(
      '/hotels/Tainan/star%3A5',
    );
    expect(rescopedHref('/scenes', '', 'Tainan')).toBe('/scenes/Tainan');
    expect(rescopedHref('/events/upcoming/Taipei/page/3', '', 'Tainan')).toBe(
      '/events/upcoming/Tainan',
    );
    expect(rescopedHref('/events', '', 'Tainan')).toBe(
      '/events/ongoing/Tainan',
    );
  });

  test('drops the city when the preference is cleared', () => {
    expect(rescopedHref('/scenes/Taipei', '', undefined)).toBe('/scenes');
    expect(rescopedHref('/scenes/Taipei/12', '', undefined)).toBe(
      '/scenes/all/12',
    );
    expect(rescopedHref('/events/ongoing/Taipei', '', undefined)).toBe(
      '/events',
    );
    expect(rescopedHref('/events/free/Taipei', '', undefined)).toBe(
      '/events/free',
    );
    expect(rescopedHref('/search', 'q=a&city=Taipei', undefined)).toBe(
      '/search?q=a',
    );
  });

  test('re-scopes search and ignores other pages or no-ops', () => {
    expect(rescopedHref('/search', 'q=a', 'Tainan')).toBe(
      '/search?q=a&city=Tainan',
    );
    expect(rescopedHref('/Taipei', '', 'Tainan')).toBeUndefined();
    expect(rescopedHref('/scenes', '', undefined)).toBeUndefined();
    expect(rescopedHref('/scenes/Tainan', '', 'Tainan')).toBeUndefined();
  });
});
