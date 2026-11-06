/// <reference types="bun" />

import { describe, expect, test } from 'bun:test';
import type { TdxService } from '@f2e/tdx-core';

import { BikeService } from './bike';

describe('BikeService.getBikeStationsByCity', () => {
  test('puts the city in the path and forwards params', async () => {
    const urls: string[] = [];
    const service = {
      createClient: (
        _server: string,
        create: (o: Record<string, unknown>) => unknown,
      ) =>
        create({
          baseUrl: 'https://tdx.test/api/basic',
          fetch: (request: Request) => {
            urls.push(request.url);

            return Promise.resolve(Response.json([{ StationUID: 'x' }]));
          },
        }),
    } as unknown as TdxService;

    const stations = await new BikeService(service).getBikeStationsByCity(
      'Taipei' as never,
      { top: 10 },
    );

    expect(stations).toEqual([{ StationUID: 'x' } as never]);
    expect(urls[0]).toContain('/v2/Bike/Station/City/Taipei');
    expect(urls[0]).toContain('$top=10');
  });
});
