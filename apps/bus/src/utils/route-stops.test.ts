/// <reference types="bun" />

import { describe, expect, test } from 'bun:test';
import { BusDirection, type BusStopOfRoute } from '@f2e/tdx-bus';

import {
  getDirectionDestination,
  getDirectionTabName,
  type RouteStopEntity,
} from './route-stops';

const makeRoute = (direction: BusDirection, names: string[]) =>
  ({
    Direction: direction,
    Stops: names.map((name) => ({ StopName: { Zh_tw: name } })),
  }) as unknown as BusStopOfRoute;

const entity = {
  [BusDirection.去程]: makeRoute(BusDirection.去程, ['A', 'B', 'C']),
  [BusDirection.返程]: makeRoute(BusDirection.返程, ['C', 'B', 'A']),
} as RouteStopEntity;

describe('route stop names', () => {
  test('destination is the last stop of each direction', () => {
    expect(getDirectionDestination(entity, BusDirection.去程)).toBe('C');
    expect(getDirectionDestination(entity, BusDirection.返程)).toBe('A');
  });

  test('missing direction falls back to the first available one', () => {
    const loop = {
      [BusDirection.去程]: makeRoute(BusDirection.去程, ['A', 'B']),
    } as RouteStopEntity;
    expect(getDirectionDestination(loop, BusDirection.返程)).toBe('B');
  });

  test('tab name uses destination for two directions, first stop for one', () => {
    const both = [BusDirection.去程, BusDirection.返程];
    expect(getDirectionTabName(entity, both, BusDirection.返程)).toBe('A');
    const loop = {
      [BusDirection.去程]: makeRoute(BusDirection.去程, ['A', 'B']),
    } as RouteStopEntity;
    expect(
      getDirectionTabName(loop, [BusDirection.去程], BusDirection.去程),
    ).toBe('A');
  });
});
