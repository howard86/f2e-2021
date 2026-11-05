/// <reference types="bun" />

import { describe, expect, test } from 'bun:test';

import { resolveTdxCredentials, shouldUseTdxFixtures } from './env';

const main = {
  TDX_BASE_URL: 'https://tdx',
  TDX_CLIENT_ID: 'main-id',
  TDX_CLIENT_SECRET: 'main-secret',
};
const preview = {
  TDX_PREVIEW_CLIENT_ID: 'preview-id',
  TDX_PREVIEW_CLIENT_SECRET: 'preview-secret',
};

describe('resolveTdxCredentials', () => {
  test('production always uses the main key', () => {
    expect(
      resolveTdxCredentials({ ...main, ...preview, VERCEL_ENV: 'production' }),
    ).toEqual({
      baseUrl: 'https://tdx',
      clientId: 'main-id',
      clientSecret: 'main-secret',
    });
  });

  test('previews and local dev use the preview key when it is set', () => {
    for (const VERCEL_ENV of ['preview', undefined]) {
      expect(
        resolveTdxCredentials({ ...main, ...preview, VERCEL_ENV }),
      ).toMatchObject({
        clientId: 'preview-id',
        clientSecret: 'preview-secret',
      });
    }
  });

  test('falls back to the main key without a complete preview key', () => {
    expect(
      resolveTdxCredentials({
        ...main,
        TDX_PREVIEW_CLIENT_ID: 'preview-id',
        VERCEL_ENV: 'preview',
      }),
    ).toMatchObject({ clientId: 'main-id', clientSecret: 'main-secret' });
  });
});

describe('shouldUseTdxFixtures', () => {
  test('only next dev without TDX_LIVE uses fixtures', () => {
    expect(shouldUseTdxFixtures({ NODE_ENV: 'development' })).toBe(true);
    expect(
      shouldUseTdxFixtures({ NODE_ENV: 'development', TDX_LIVE: '1' }),
    ).toBe(false);
    expect(shouldUseTdxFixtures({ NODE_ENV: 'production' })).toBe(false);
    expect(shouldUseTdxFixtures({ NODE_ENV: 'test' })).toBe(false);
  });
});
