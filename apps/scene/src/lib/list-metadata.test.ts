/// <reference types="bun" />

import { describe, expect, test } from 'bun:test';

import {
  buildListCanonical,
  buildListMetadata,
  buildListTitle,
} from './list-metadata';

describe('buildListTitle', () => {
  test('names the type alone for the unfiltered lists', () => {
    expect(buildListTitle({ page: 1, type: 'scene' })).toBe('景點');
    expect(buildListTitle({ city: 'all', page: 1, type: 'hotel' })).toBe(
      '住宿',
    );
    expect(buildListTitle({ page: 1, type: 'activity', when: 'ongoing' })).toBe(
      '活動',
    );
  });

  test('joins city, tag and page', () => {
    expect(buildListTitle({ city: 'Taipei', page: 1, type: 'scene' })).toBe(
      '臺北市 · 景點',
    );
    expect(
      buildListTitle({
        city: 'Taipei',
        page: 3,
        tagLabel: '自然風景類',
        type: 'scene',
      }),
    ).toBe('臺北市 · 自然風景類景點 · 第 3 頁');
  });

  test('names the events window', () => {
    expect(buildListTitle({ page: 1, type: 'activity', when: 'free' })).toBe(
      '免費活動',
    );
    expect(
      buildListTitle({
        city: 'Taipei',
        page: 1,
        type: 'activity',
        when: 'ongoing',
      }),
    ).toBe('臺北市 · 進行中活動');
  });
});

describe('buildListMetadata', () => {
  test('uses the normalised canonical path', () => {
    const meta = buildListMetadata({
      city: 'Taipei',
      page: 2,
      tag: '1',
      tagLabel: 'x',
      type: 'scene',
    });

    expect(meta.alternates?.canonical).toBe('/scenes/Taipei/1/page/2');
    expect(
      buildListMetadata({ page: 1, type: 'activity', when: 'upcoming' })
        .alternates?.canonical,
    ).toBe('/events/upcoming');
  });

  test('carries a full openGraph object', () => {
    const meta = buildListMetadata({ page: 1, type: 'restaurant' });

    expect(meta.openGraph).toMatchObject({
      locale: 'zh_TW',
      title: '美食',
      type: 'website',
    });
  });
});

describe('buildListCanonical', () => {
  test('points the bare all-cities list at the unfiltered URL', () => {
    expect(buildListCanonical({ city: 'all', page: 1, type: 'scene' })).toBe(
      '/scenes',
    );
    expect(
      buildListCanonical({ city: 'all', page: 2, type: 'scene' }),
    ).not.toBe('/scenes');
  });
});
