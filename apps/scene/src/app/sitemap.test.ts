/// <reference types="bun" />

import { describe, expect, test } from 'bun:test';

import sitemap from './sitemap';

describe('sitemap', () => {
  const urls = sitemap().map((item) => new URL(item.url).pathname);

  test('includes the home page, a city and its lists', () => {
    expect(urls).toContain('/');
    expect(urls).toContain('/Taipei');
    expect(urls).toContain('/transports/Taipei');
    expect(urls).toContain('/scenes/Taipei');
    expect(urls).toContain('/events/ongoing/Taipei');
  });

  test('has no duplicates', () => {
    expect(new Set(urls).size).toBe(urls.length);
  });
});
