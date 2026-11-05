/// <reference types="bun" />

import { describe, expect, test } from 'bun:test';

import { badRequest, handleApi } from './api';

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
