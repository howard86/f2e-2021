/// <reference types="bun" />

import { describe, expect, test } from 'bun:test';
import type { BusStopOfRoute } from '@f2e/tdx-bus';

import { roundGeoJson, slimRouteStops } from './slim-route';

describe('slimRouteStops', () => {
  test('keeps only the fields the view reads', () => {
    const route = {
      Direction: 0,
      RouteUID: 'R',
      Stops: [
        {
          StationID: 'x',
          StopBoarding: 1,
          StopName: { En: 'A', Zh_tw: '甲' },
          StopPosition: {
            GeoHash: 'abc',
            PositionLat: 25.1,
            PositionLon: 121.5,
          },
          StopSequence: 1,
          StopUID: 'U1',
        },
      ],
    } as unknown as BusStopOfRoute;

    expect(slimRouteStops(route)).toEqual({
      Stops: [
        {
          StopName: { Zh_tw: '甲' },
          StopPosition: { PositionLat: 25.1, PositionLon: 121.5 },
          StopSequence: 1,
          StopUID: 'U1',
        },
      ],
    });
  });
});

describe('roundGeoJson', () => {
  test('rounds coordinates to 6 decimals and keeps the type', () => {
    const result = roundGeoJson({
      coordinates: [
        [121.123_456_789, 25.987_654_321],
        [121.5, 25],
      ],
      type: 'LineString',
    });

    expect(result).toEqual({
      coordinates: [
        [121.123_457, 25.987_654],
        [121.5, 25],
      ],
      type: 'LineString',
    });
  });
});
