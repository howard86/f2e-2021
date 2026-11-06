import type { City } from '@f2e/tdx-core';
import type { MetroSystem } from '@f2e/tdx-rail';

export const METRO_SYSTEM_NAMES: Record<MetroSystem, string> = {
  KLRT: '高雄輕軌',
  KRTC: '高雄捷運',
  NTMC: '新北捷運',
  TMRT: '臺中捷運',
  TRTC: '臺北捷運',
  TYMC: '桃園捷運',
};

/** Metro systems that serve a city (a system can stop in several cities). */
const CITY_METRO_SYSTEMS: Partial<Record<City, MetroSystem[]>> = {
  Kaohsiung: ['KRTC', 'KLRT'],
  NewTaipei: ['TRTC', 'NTMC', 'TYMC'],
  Taichung: ['TMRT'],
  Taipei: ['TRTC', 'TYMC'],
  Taoyuan: ['TYMC'],
};

export const metroSystemsOf = (city: City): MetroSystem[] =>
  CITY_METRO_SYSTEMS[city] ?? [];

export const BUS_APP_URL = 'https://bus.howardism.dev';

// TDX rejects (HTTP 400, never cached, so it would re-spend the 5/min quota
// on every request) cities outside an operation's City enum. These mirror the
// enums of the generated per-city operations.

/** /v2/Bike/Station/City/{City}. */
const BIKE_STATION_CITIES = new Set<City>([
  'Taichung',
  'Hsinchu',
  'MiaoliCounty',
  'ChanghuaCounty',
  'NewTaipei',
  'YunlinCounty',
  'ChiayiCounty',
  'PingtungCounty',
  'TaitungCounty',
  'Taoyuan',
  'Taipei',
  'Kaohsiung',
  'Tainan',
  'Chiayi',
  'HsinchuCounty',
]);

/** /v2/Cycling/Shape/City/{City}: no Hsinchu, no LienchiangCounty. */
const CYCLING_SHAPE_UNSUPPORTED = new Set<City>([
  'Hsinchu',
  'LienchiangCounty',
]);

/** /v2/Bus/News/City/{City}: every city except LienchiangCounty. */
const BUS_NEWS_UNSUPPORTED = new Set<City>(['LienchiangCounty']);

export const supportsBikeData = (city: City): boolean =>
  BIKE_STATION_CITIES.has(city);

export const supportsCyclingData = (city: City): boolean =>
  !CYCLING_SHAPE_UNSUPPORTED.has(city);

export const supportsBusNews = (city: City): boolean =>
  !BUS_NEWS_UNSUPPORTED.has(city);
