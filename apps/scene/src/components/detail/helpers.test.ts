/// <reference types="bun" />

import { describe, expect, test } from 'bun:test';

import type { PlaceDetail } from '@/types/place';

import {
  buildIcs,
  buildJsonLd,
  COLLAPSE_THRESHOLD,
  serializeJsonLd,
  shouldCollapse,
  toIcsLocal,
  truncate,
} from './helpers';

const detail: PlaceDetail = {
  calendar: { end: '2026-02-01T10:00:00+08:00', start: '2026-01-31T09:30:00Z' },
  city: '臺北市',
  citySlug: 'Taipei',
  facts: [
    { key: 'address', kind: 'map', label: '地址', value: '中正路1號' },
    { key: 'phone', kind: 'phone', label: '電話', value: '02-1234' },
  ],
  href: '/Taipei/activity/1',
  id: '1',
  images: [{ url: 'https://x/y.jpg' }],
  name: '燈會 </script>',
  sections: [],
  tags: [],
  town: '中正區',
  type: 'activity',
};

describe('helpers', () => {
  test('shouldCollapse uses the threshold', () => {
    expect(shouldCollapse('a'.repeat(COLLAPSE_THRESHOLD))).toBe(false);
    expect(shouldCollapse('a'.repeat(COLLAPSE_THRESHOLD + 1))).toBe(true);
  });

  test('truncate flattens whitespace and clips', () => {
    expect(truncate('a\n b', 10)).toBe('a b');
    expect(truncate('abcdef', 3)).toBe('abc…');
  });

  test('toIcsLocal converts to Taipei wall-clock', () => {
    expect(toIcsLocal('2026-01-31T16:30:00Z')).toBe('20260201T003000');
    expect(toIcsLocal('nope')).toBeUndefined();
  });

  test('buildIcs emits an event in Asia/Taipei', () => {
    const ics = buildIcs({ ...detail, location: '台北, 中正' });

    expect(ics).toContain('DTSTART;TZID=Asia/Taipei:20260131T173000');
    expect(ics).toContain('DTEND;TZID=Asia/Taipei:20260201T100000');
    expect(ics).toContain('LOCATION:台北\\, 中正');
    expect(buildIcs({ ...detail, calendar: undefined })).toBeUndefined();
  });

  test('buildJsonLd maps type and escapes output', () => {
    const ld = buildJsonLd(detail);

    expect(ld['@type']).toBe('Event');
    expect(ld.telephone).toBe('02-1234');
    expect(serializeJsonLd(ld)).not.toContain('<');
    expect(buildJsonLd({ ...detail, type: 'hotel' })['@type']).toBe('Hotel');
  });
});
