/// <reference types="bun" />

import { describe, expect, test } from 'bun:test';
import type { TdxService } from '@f2e/tdx-core';

import { RailService } from './rail';

const createService = (payload: unknown) => {
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

          return Promise.resolve(Response.json(payload));
        },
      }),
  } as unknown as TdxService;

  return { rail: new RailService(service), urls };
};

describe('RailService', () => {
  test('unwraps v3 TRA stations and sends no default $top', async () => {
    const { rail, urls } = createService({ Stations: [{ StationID: '1000' }] });

    expect(await rail.getTraStations()).toEqual([
      { StationID: '1000' } as never,
    ]);
    expect(urls[0]).toContain('/v3/Rail/TRA/Station');
    expect(urls[0]).not.toContain('$top');
  });

  test('unwraps v3 TRA alerts', async () => {
    const { rail } = createService({ Alerts: [{ AlertID: 'a' }] });

    expect(await rail.getTraAlerts()).toEqual([{ AlertID: 'a' } as never]);
  });

  test('puts the metro system in the path and unwraps alerts', async () => {
    const { rail, urls } = createService({ Alerts: [{ AlertID: 'm' }] });

    expect(await rail.getMetroAlerts('TRTC')).toEqual([
      { AlertID: 'm' } as never,
    ]);
    expect(urls[0]).toContain('/v2/Rail/Metro/Alert/TRTC');
  });

  test('returns v2 arrays as is and forwards params', async () => {
    const { rail, urls } = createService([{ LineID: 'BL' }]);

    expect(await rail.getMetroLines('KRTC', { top: 5 })).toEqual([
      { LineID: 'BL' } as never,
    ]);
    expect(urls[0]).toContain('/v2/Rail/Metro/Line/KRTC');
    expect(urls[0]).toContain('$top=5');
  });

  test('queries the THSR endpoints', async () => {
    const { rail, urls } = createService([]);

    await rail.getThsrStations();
    await rail.getThsrODFares();
    await rail.getThsrGeneralTimetable();
    await rail.getThsrAlerts();

    expect(urls.map((u) => new URL(u).pathname)).toEqual([
      '/api/basic/v2/Rail/THSR/Station',
      '/api/basic/v2/Rail/THSR/ODFare',
      '/api/basic/v2/Rail/THSR/GeneralTimetable',
      '/api/basic/v2/Rail/THSR/AlertInfo',
    ]);
  });
});
