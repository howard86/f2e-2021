import { type ApiParam, type TdxService, toODataQuery } from '@f2e/tdx-core';
import type {
  MetroApiAlert2107Responses,
  MetroApiLine2091Responses,
  MetroApiStation2092Responses,
  ThsrApiAlertInfo2127Responses,
  ThsrApiGeneralTimetable2122Responses,
  ThsrApiOdFare2121Responses,
  ThsrApiStation2120Responses,
} from './generated/rail-basic-v2';
import {
  metroApiAlert2107,
  metroApiLine2091,
  metroApiStation2092,
  thsrApiAlertInfo2127,
  thsrApiGeneralTimetable2122,
  thsrApiOdFare2121,
  thsrApiStation2120,
} from './generated/rail-basic-v2';
import {
  createClient as createBasicV2Client,
  createConfig as createBasicV2Config,
} from './generated/rail-basic-v2/client';
import type {
  AlertApiControllerGet3218Responses,
  StationApiControllerGet3201Responses,
} from './generated/rail-basic-v3';
import {
  alertApiControllerGet3218,
  stationApiControllerGet3201,
} from './generated/rail-basic-v3';
import {
  createClient as createBasicV3Client,
  createConfig as createBasicV3Config,
} from './generated/rail-basic-v3/client';

/** Metro systems served by /v2/Rail/Metro/{Line,Station,Alert}/{RailSystem}. */
export type MetroSystem = 'TRTC' | 'NTMC' | 'TYMC' | 'TMRT' | 'KRTC' | 'KLRT';

/** /v2/Rail/Metro/Alert rejects NTMC with a 400 (verified live). */
export type MetroAlertSystem = Exclude<MetroSystem, 'NTMC'>;

export type ThsrStation = ThsrApiStation2120Responses[200][number];
export type ThsrODFare = ThsrApiOdFare2121Responses[200][number];
export type ThsrGeneralTimetable =
  ThsrApiGeneralTimetable2122Responses[200][number];
export type ThsrAlert = ThsrApiAlertInfo2127Responses[200][number];
export type TraStation =
  StationApiControllerGet3201Responses[200]['Stations'][number];
export type TraAlert =
  AlertApiControllerGet3218Responses[200]['Alerts'][number];
export type MetroLine = MetroApiLine2091Responses[200][number];
export type MetroStation = MetroApiStation2092Responses[200][number];
export type MetroAlert = MetroApiAlert2107Responses[200]['Alerts'][number];

export class RailService {
  private readonly v2: ReturnType<typeof createBasicV2Client>;

  private readonly v3: ReturnType<typeof createBasicV3Client>;

  // No default $top: the lists here (TRA stations, THSR ODFare) must come back
  // whole, and an omitted $top returns everything.
  constructor(service: TdxService) {
    this.v2 = service.createClient('basic', (o) =>
      createBasicV2Client(createBasicV2Config(o)),
    );
    this.v3 = service.createClient('basic', (o) =>
      createBasicV3Client(createBasicV3Config(o)),
    );
  }

  async getThsrStations(param: ApiParam = {}) {
    const { data } = await thsrApiStation2120({
      client: this.v2,
      query: toODataQuery(param),
      throwOnError: true,
    });

    return data as ThsrStation[];
  }

  async getThsrODFares(param: ApiParam = {}) {
    const { data } = await thsrApiOdFare2121({
      client: this.v2,
      query: toODataQuery(param),
      throwOnError: true,
    });

    return data as ThsrODFare[];
  }

  async getThsrGeneralTimetable(param: ApiParam = {}) {
    const { data } = await thsrApiGeneralTimetable2122({
      client: this.v2,
      query: toODataQuery(param),
      throwOnError: true,
    });

    return data as ThsrGeneralTimetable[];
  }

  async getThsrAlerts(param: ApiParam = {}) {
    const { data } = await thsrApiAlertInfo2127({
      client: this.v2,
      query: toODataQuery(param),
      throwOnError: true,
    });

    return data as ThsrAlert[];
  }

  /** v3: unwraps the response's `Stations`. */
  async getTraStations(param: ApiParam = {}) {
    const { data } = await stationApiControllerGet3201({
      client: this.v3,
      query: toODataQuery(param),
      throwOnError: true,
    });

    return (data as { Stations: TraStation[] }).Stations;
  }

  /** v3: unwraps the response's `Alerts`. */
  async getTraAlerts(param: ApiParam = {}) {
    const { data } = await alertApiControllerGet3218({
      client: this.v3,
      query: toODataQuery(param),
      throwOnError: true,
    });

    return (data as { Alerts: TraAlert[] }).Alerts;
  }

  async getMetroLines(system: MetroSystem, param: ApiParam = {}) {
    const { data } = await metroApiLine2091({
      client: this.v2,
      path: { RailSystem: system },
      query: toODataQuery(param),
      throwOnError: true,
    });

    return data as MetroLine[];
  }

  async getMetroStations(system: MetroSystem, param: ApiParam = {}) {
    const { data } = await metroApiStation2092({
      client: this.v2,
      path: { RailSystem: system },
      query: toODataQuery(param),
      throwOnError: true,
    });

    return data as MetroStation[];
  }

  /** Unwraps the response's `Alerts`. */
  async getMetroAlerts(system: MetroAlertSystem, param: ApiParam = {}) {
    const { data } = await metroApiAlert2107({
      client: this.v2,
      path: { RailSystem: system },
      query: toODataQuery(param),
      throwOnError: true,
    });

    return (data as { Alerts: MetroAlert[] }).Alerts;
  }
}
