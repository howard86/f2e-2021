/// <reference types="bun" />

import { describe, expect, test } from 'bun:test';
import type { GeoJSONMultiLineString } from 'wellknown';

import { roundGeoJson, roundTo } from '@/services/utils';

describe('roundTo', () => {
  test('rounds to the given decimals', () => {
    expect(roundTo(25.012_345_6, 3)).toBe(25.012);
    expect(roundTo(121.5, 3)).toBe(121.5);
  });
});

describe('roundGeoJson', () => {
  test('rounds every coordinate to 5 decimals and keeps the shape', () => {
    const input: GeoJSONMultiLineString = {
      coordinates: [
        [
          [121.123_456_789, 25.987_654_321],
          [121.5, 25.1],
        ],
        [[120.000_004, 23.000_006]],
      ],
      type: 'MultiLineString',
    };

    expect(roundGeoJson(input)).toEqual({
      coordinates: [
        [
          [121.123_46, 25.987_65],
          [121.5, 25.1],
        ],
        [[120, 23.000_01]],
      ],
      type: 'MultiLineString',
    });
    expect(input.coordinates[0][0][0]).toBe(121.123_456_789);
  });
});
