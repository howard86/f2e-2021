/// <reference types="bun" />

import { describe, expect, test } from 'bun:test';

import { badRequest, handleApi, roundCoordinate } from './api';

describe('roundCoordinate', () => {
  test('rounds to 3 decimals', () => {
    expect(roundCoordinate(25.033_48)).toBe(25.033);
    expect(roundCoordinate(121.5654)).toBe(121.565);
  });
});

describe('handleApi', () => {
  test('sets Cache-Control on success only', async () => {
    const ok = await handleApi(() => 1, 'public, s-maxage=15');
    expect(ok.headers.get('Cache-Control')).toBe('public, s-maxage=15');

    const failed = await handleApi(() => {
      throw badRequest();
    }, 'public, s-maxage=15');
    expect(failed.status).toBe(400);
    expect(failed.headers.get('Cache-Control')).toBeNull();
  });

  test('omits Cache-Control by default', async () => {
    expect((await handleApi(() => 1)).headers.get('Cache-Control')).toBeNull();
  });
});
