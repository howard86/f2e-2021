/// <reference types="bun" />

import { describe, expect, test } from 'bun:test';
import {
  supportsBikeData,
  supportsBusNews,
  supportsCyclingData,
} from '../constants/transports';
import {
  bikeSystemsOf,
  cityOfAddress,
  cyclingKmOf,
  mergeNotices,
  nearestStations,
  toBikeStationRows,
  toBusSummary,
  toMetroLines,
  toNotices,
  toThsrFares,
  toThsrStations,
  toThsrTimetableSummary,
  toTraStations,
} from './transport-mappers';

const name = (Zh_tw: string) => ({ Zh_tw });
const point = (PositionLat: number, PositionLon: number) => ({
  PositionLat,
  PositionLon,
});

describe('toBusSummary', () => {
  const route = (
    routeName: string,
    operator: string,
    from?: string,
    to?: string,
  ) => ({
    DepartureStopNameZh: from,
    DestinationStopNameZh: to,
    Operators: [{ OperatorName: name(operator) }],
    RouteName: name(routeName),
  });

  test('counts distinct routes, dedupes operators, samples sorted by name', () => {
    const routes = Array.from({ length: 20 }, (_, index) =>
      route(String(20 - index), index % 2 ? '甲客運' : '乙客運'),
    );
    const summary = toBusSummary('Taipei', [
      ...routes,
      route('20', '丙客運'),
      route('紅 1', '甲客運', '公館', '動物園'),
    ]);

    expect(summary?.routeCount).toBe(21);
    expect(summary?.operators).toEqual(['乙客運', '丙客運', '甲客運']);
    expect(summary?.routes).toHaveLength(12);
    expect(summary?.routes.slice(0, 3).map((item) => item.name)).toEqual([
      '1',
      '2',
      '3',
    ]);
  });

  test('builds the bus-app deep link and headsign', () => {
    const summary = toBusSummary('Taipei', [
      route('紅 1/2', '甲客運', '公館', '動物園'),
    ]);

    expect(summary?.routes[0]).toEqual({
      headsign: '公館 - 動物園',
      href: 'https://bus.howardism.dev/city/Taipei/%E7%B4%85%201%2F2',
      name: '紅 1/2',
    });
  });

  test('returns undefined for no routes', () => {
    expect(toBusSummary('Taipei', [])).toBeUndefined();
  });
});

describe('bike', () => {
  const station = (id: string, label: string, type?: number) => ({
    ServiceType: type,
    StationName: name(label),
    StationPosition: point(25, 121),
    StationUID: id,
  });

  test('strips the system prefix and skips stations without a position', () => {
    const rows = toBikeStationRows([
      station('A', 'YouBike2.0_捷運公館站', 2),
      station('B', 'YouBike1.0_動物園', 1),
      { StationName: name('x'), StationUID: 'C' },
    ]);

    expect(rows.map((row) => row.name)).toEqual(['捷運公館站', '動物園']);
    expect(rows[0]).toMatchObject({ kind: 'Bike', operator: 'YouBike' });
  });

  test('lists systems from ServiceType', () => {
    const rows = toBikeStationRows([
      station('A', 'a', 2),
      station('B', 'b', 1),
      station('C', 'c', 2),
      station('D', 'd'),
    ]);

    expect(bikeSystemsOf(rows)).toEqual(['YouBike 1.0', 'YouBike 2.0']);
  });

  test('sums CyclingLength metres into km to one decimal', () => {
    expect(
      cyclingKmOf([
        { CyclingLength: 1234 },
        { CyclingLength: 5000 },
        { CyclingLength: null },
        {},
      ]),
    ).toBe(6.2);
  });
});

describe('THSR', () => {
  test('orders stations north to south', () => {
    const stations = toThsrStations([
      {
        StationID: '1070',
        StationName: name('左營'),
        StationPosition: point(22.7, 120.3),
      },
      {
        StationID: '0990',
        StationName: name('南港'),
        StationPosition: point(25.05, 121.6),
      },
      {
        StationID: '1000',
        StationName: name('臺北'),
        StationPosition: point(25.04, 121.5),
      },
      { StationID: '1010', StationName: name('板橋') },
    ]);

    expect(stations.map((station) => station.name)).toEqual([
      '南港',
      '臺北',
      '左營',
    ]);
    expect(stations[0]).toMatchObject({ kind: 'THSR', operator: '高鐵' });
  });

  test('picks the adult standard-car single-ticket fare', () => {
    const fares = toThsrFares([
      {
        DestinationStationID: '1070',
        Fares: [
          { CabinClass: 2, FareClass: 1, Price: 2800, TicketType: 1 },
          { CabinClass: 1, FareClass: 2, Price: 1000, TicketType: 1 },
          { CabinClass: 1, FareClass: 1, Price: 1490, TicketType: 2 },
          { CabinClass: 1, FareClass: 1, Price: 1530, TicketType: 1 },
        ],
        OriginStationID: '1000',
      },
      { DestinationStationID: '1010', Fares: [], OriginStationID: '1000' },
    ]);

    expect(fares).toEqual([
      { destinationId: '1070', originId: '1000', price: 1530 },
    ]);
  });

  test('summarises trains and first/last departures for a service day', () => {
    const train = (no: string, monday: number, ...times: string[]) => ({
      GeneralTimetable: {
        GeneralTrainInfo: { TrainNo: no },
        ServiceDay: { Monday: monday },
        StopTimes: times.map((DepartureTime, index) => ({
          DepartureTime,
          StopSequence: times.length - index,
        })),
      },
    });

    expect(
      toThsrTimetableSummary([
        train('0801', 1, '07:00', '06:00'),
        train('0803', 1, '23:30'),
        train('0805', 0, '05:00'),
      ]),
    ).toEqual({
      firstDeparture: '06:00',
      lastDeparture: '23:30',
      trainCount: 2,
    });
  });
});

describe('TRA', () => {
  test('maps the address prefix to a City', () => {
    expect(cityOfAddress('臺北市中正區黎明里北平西路3號')).toBe('Taipei');
    expect(cityOfAddress('台北市中正區北平西路3號')).toBe('Taipei');
    expect(cityOfAddress('100 新北市板橋區縣民大道')).toBe('NewTaipei');
    expect(cityOfAddress('嘉義縣民雄鄉')).toBe('ChiayiCounty');
    expect(cityOfAddress('嘉義市西區')).toBe('Chiayi');
    expect(cityOfAddress('新竹縣竹北市')).toBe('HsinchuCounty');
    expect(cityOfAddress('Unknown')).toBeUndefined();
    expect(cityOfAddress(null)).toBeUndefined();
  });

  test('keeps the city on each row', () => {
    const [row] = toTraStations([
      {
        StationAddress: '高雄市三民區建國二路',
        StationID: '4400',
        StationName: name('高雄'),
        StationPosition: point(22.6, 120.3),
      },
    ]);

    expect(row).toMatchObject({
      city: 'Kaohsiung',
      id: 'tra-4400',
      kind: 'TRA',
    });
  });
});

describe('toMetroLines', () => {
  const lines = [
    { LineColor: '0070BD', LineID: 'BL', LineName: name('板南線') },
    { LineColor: 'E3002C', LineID: 'R', LineName: name('淡水信義線') },
  ];
  const stations = ['BL12', 'BL13', 'R22A', 'R23', 'R24', 'G01'].map(
    (StationID) => ({ StationID }),
  );

  test('counts stations by StationID line prefix', () => {
    expect(toMetroLines('臺北捷運', lines, stations)).toEqual([
      {
        color: '#0070BD',
        lineId: 'BL',
        name: '板南線',
        stationCount: 2,
        systemName: '臺北捷運',
      },
      {
        color: '#E3002C',
        lineId: 'R',
        name: '淡水信義線',
        stationCount: 3,
        systemName: '臺北捷運',
      },
    ]);
  });

  test('a single-line system gets every station', () => {
    const [line] = toMetroLines(
      '臺中捷運',
      [lines[0]],
      [{ StationID: '119' }, { StationID: '120' }],
    );

    expect(line.stationCount).toBe(2);
  });
});

describe('notices', () => {
  const now = Date.parse('2026-06-01T00:00:00Z');
  const item = (
    id: string,
    title: string,
    published: string,
    end?: string,
  ) => ({
    EndTime: end,
    id,
    PublishTime: published,
    Title: title,
  });

  test('drops ended notices and clips long descriptions', () => {
    const notices = toNotices(
      '台鐵',
      [
        item('1', 'old', '2026-01-01T00:00:00Z', '2026-02-01T00:00:00Z'),
        {
          ...item('2', 'live', '2026-05-01T00:00:00Z'),
          Description: 'x'.repeat(500),
        },
      ],
      now,
    );

    expect(notices).toHaveLength(1);
    expect(notices[0].id).toBe('台鐵-2');
    expect(notices[0].description).toHaveLength(161);
  });

  test('merges, dedupes by source and title, sorts newest first, caps at limit', () => {
    const bus = toNotices(
      '公車',
      [
        item('1', 'A', '2026-05-01T00:00:00Z'),
        item('2', 'A', '2026-05-02T00:00:00Z'),
        item('3', 'B', '2026-05-03T00:00:00Z'),
      ],
      now,
    );
    const tra = toNotices(
      '台鐵',
      [item('9', 'A', '2026-05-04T00:00:00Z')],
      now,
    );

    expect(mergeNotices([bus, tra]).map((notice) => notice.id)).toEqual([
      '台鐵-9',
      '公車-3',
      '公車-1',
    ]);
    expect(mergeNotices([bus, tra], 2)).toHaveLength(2);
  });
});

describe('nearestStations', () => {
  const at = (kind: 'TRA' | 'Bike' | 'Metro', lat: number, id: string) => ({
    id,
    kind,
    name: id,
    operator: 'x',
    position: { lat, lng: 121 },
  });
  const origin = { lat: 25, lng: 121 };

  test('picks the closest per kind within range, nearest first', () => {
    const result = nearestStations(
      origin,
      [
        at('TRA', 25.02, 'far-tra'),
        at('TRA', 25.01, 'near-tra'),
        at('Bike', 25.001, 'bike'),
        at('Metro', 25.5, 'out-of-range'),
      ],
      3,
    );

    expect(result.map((station) => station.id)).toEqual(['bike', 'near-tra']);
    expect(result[0].distanceKm).toBeLessThan(result[1].distanceKm);
  });
});

describe('per-city TDX support', () => {
  test('bike stations exclude cities outside the TDX enum', () => {
    expect(supportsBikeData('Taipei')).toBe(true);
    expect(supportsBikeData('Hsinchu')).toBe(true);
    expect(supportsBikeData('Keelung')).toBe(false);
    expect(supportsBikeData('PenghuCounty')).toBe(false);
  });

  test('cycling shapes and bus news have their own sets', () => {
    expect(supportsCyclingData('Keelung')).toBe(true);
    expect(supportsCyclingData('Hsinchu')).toBe(false);
    expect(supportsBusNews('Taipei')).toBe(true);
    expect(supportsBusNews('LienchiangCounty')).toBe(false);
  });
});
