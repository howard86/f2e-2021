// TDX-backed transport data for the /transports pages and place details.
// TDX allows 5 requests a minute, so every dataset is cached across requests
// with unstable_cache: static lists for a day or a week (national ones are
// fetched once and shared by all cities), notices for an hour. Only trimmed,
// mapped values are cached (Vercel drops entries over 2 MB). A fetch failure
// throws inside the cached function, so it is never cached, and is caught
// outside: the section degrades instead of the page.
import type { City } from '@f2e/tdx-core';
import type { MetroAlertSystem, MetroSystem } from '@f2e/tdx-rail';
import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import {
  METRO_SYSTEM_NAMES,
  metroSystemsOf,
  supportsBikeData,
  supportsBusNews,
  supportsCyclingData,
} from '@/constants/transports';
import { bikeService, busService, railService } from '@/services/tdx';
import {
  type BikeStationRow,
  bikeSystemsOf,
  cyclingKmOf,
  mergeNotices,
  nearestStations,
  type TraStationRow,
  toBikeStationRows,
  toBusSummary,
  toMetroLines,
  toMetroStations,
  toNotices,
  toThsrFares,
  toThsrStations,
  toThsrTimetableSummary,
  toTraStations,
} from '@/services/transport-mappers';
import type {
  BikeSummary,
  BusSummary,
  MetroLineSummary,
  NearestStation,
  ServiceNotice,
  StationPoint,
  ThsrOverview,
  TransportLatLng,
} from '@/types/transport';

const ONE_HOUR = 60 * 60;
const ONE_DAY = 24 * ONE_HOUR;
const ONE_WEEK = 7 * ONE_DAY;
const MAX_ROWS = 5000;
const NO_FILTER = { top: MAX_ROWS };

interface MetroData {
  lines: MetroLineSummary[];
  stations: StationPoint[];
}

interface ThsrTimetable {
  firstDeparture?: string;
  lastDeparture?: string;
  trainCount: number;
}

// --- cached datasets (primitive arguments only: they are the cache key) -----

const cachedBusSummary = unstable_cache(
  async (city: string): Promise<BusSummary | null> =>
    toBusSummary(
      city as City,
      await busService.getBusRoutesByCity(city as City, {
        select: 'RouteName,Operators,DepartureStopNameZh,DestinationStopNameZh',
        ...NO_FILTER,
      }),
    ) ?? null,
  ['transports:bus'],
  { revalidate: ONE_DAY },
);

const cachedBikeStations = unstable_cache(
  async (city: string): Promise<BikeStationRow[]> =>
    toBikeStationRows(
      await bikeService.getBikeStationsByCity(city as City, {
        select: 'StationUID,StationID,StationName,StationPosition,ServiceType',
        ...NO_FILTER,
      }),
    ),
  ['transports:bike-stations'],
  { revalidate: ONE_DAY },
);

const cachedCyclingKm = unstable_cache(
  async (city: string): Promise<number> =>
    cyclingKmOf(
      await bikeService.getCyclingShapeByCity(city as City, {
        select: 'CyclingLength',
        ...NO_FILTER,
      }),
    ),
  ['transports:cycling-km'],
  { revalidate: ONE_DAY },
);

const cachedThsrStations = unstable_cache(
  async (): Promise<StationPoint[]> =>
    toThsrStations(await railService.getThsrStations()),
  ['transports:thsr-stations'],
  { revalidate: ONE_WEEK },
);

const cachedThsrFares = unstable_cache(
  async () => toThsrFares(await railService.getThsrODFares(NO_FILTER)),
  ['transports:thsr-fares'],
  { revalidate: ONE_WEEK },
);

const cachedThsrTimetable = unstable_cache(
  async (): Promise<ThsrTimetable> =>
    toThsrTimetableSummary(
      await railService.getThsrGeneralTimetable(NO_FILTER),
    ),
  ['transports:thsr-timetable'],
  { revalidate: ONE_WEEK },
);

const cachedTraStations = unstable_cache(
  async (): Promise<TraStationRow[]> =>
    toTraStations(await railService.getTraStations()),
  ['transports:tra-stations'],
  { revalidate: ONE_WEEK },
);

const cachedMetro = unstable_cache(
  async (system: string): Promise<MetroData> => {
    const name = METRO_SYSTEM_NAMES[system as MetroSystem];
    const [lines, stations] = await Promise.all([
      railService.getMetroLines(system as MetroSystem, NO_FILTER),
      railService.getMetroStations(system as MetroSystem, NO_FILTER),
    ]);

    return {
      lines: toMetroLines(name, lines, stations),
      stations: toMetroStations(name, system, stations),
    };
  },
  ['transports:metro'],
  { revalidate: ONE_WEEK },
);

const cachedBusNews = unstable_cache(
  async (city: string): Promise<ServiceNotice[]> =>
    toNotices(
      '公車',
      (await busService.getBusNewsByCity(city as City, NO_FILTER)).map(
        (news) => ({
          Description: news.Description,
          EndTime: news.EndTime,
          id: news.NewsID,
          PublishTime: news.PublishTime,
          Title: news.Title,
          Url: news.NewsURL,
        }),
      ),
    ),
  ['transports:bus-news'],
  { revalidate: ONE_HOUR },
);

const alertItems = (
  alerts: {
    AlertID: string;
    AlertURL?: string | null;
    Description?: string | null;
    EndTime?: string | null;
    PublishTime?: string | null;
    Title: string;
    UpdateTime?: string;
  }[],
) =>
  alerts.map((alert) => ({
    Description: alert.Description,
    EndTime: alert.EndTime,
    id: alert.AlertID,
    PublishTime: alert.PublishTime,
    Title: alert.Title,
    UpdateTime: alert.UpdateTime,
    Url: alert.AlertURL,
  }));

const cachedTraAlerts = unstable_cache(
  async (): Promise<ServiceNotice[]> =>
    toNotices('台鐵', alertItems(await railService.getTraAlerts())),
  ['transports:tra-alerts'],
  { revalidate: ONE_HOUR },
);

const cachedThsrAlerts = unstable_cache(
  async (): Promise<ServiceNotice[]> =>
    toNotices('高鐵', alertItems(await railService.getThsrAlerts())),
  ['transports:thsr-alerts'],
  { revalidate: ONE_HOUR },
);

const cachedMetroAlerts = unstable_cache(
  async (system: string): Promise<ServiceNotice[]> =>
    toNotices(
      METRO_SYSTEM_NAMES[system as MetroSystem],
      alertItems(await railService.getMetroAlerts(system as MetroAlertSystem)),
    ),
  ['transports:metro-alerts'],
  { revalidate: ONE_HOUR },
);

// --- failure handling --------------------------------------------------------

const attempt = async <T>(label: string, run: () => Promise<T>) => {
  try {
    return await run();
  } catch (error) {
    console.error(`[transports] ${label} unavailable`, error);
  }
};

// --- per-request deduped readers ----------------------------------------------

const readBikeStations = cache((city: City) =>
  supportsBikeData(city)
    ? attempt(`bike stations ${city}`, () => cachedBikeStations(city))
    : Promise.resolve(undefined),
);

const readTraStations = cache(() =>
  attempt('tra stations', () => cachedTraStations()),
);

const readThsrStations = cache(() =>
  attempt('thsr stations', () => cachedThsrStations()),
);

const readMetro = cache(async (city: City): Promise<MetroData[]> => {
  const results = await Promise.all(
    metroSystemsOf(city).map((system) =>
      attempt(`metro ${system}`, () => cachedMetro(system)),
    ),
  );

  return results.filter((data): data is MetroData => data !== undefined);
});

// --- public API -----------------------------------------------------------------

export const getBusSummary = cache(
  async (city: City): Promise<BusSummary | undefined> =>
    (await attempt(`bus ${city}`, () => cachedBusSummary(city))) ?? undefined,
);

export const getBikeSummary = cache(
  async (city: City): Promise<BikeSummary | undefined> => {
    const [stations, cyclingKm] = await Promise.all([
      readBikeStations(city),
      supportsCyclingData(city)
        ? attempt(`cycling ${city}`, () => cachedCyclingKm(city))
        : undefined,
    ]);

    // Stations are the headline number: without them there is no summary.
    // Missing cycling shapes only zero out the distance.
    if (!stations) {
      return undefined;
    }

    return {
      cyclingKm: cyclingKm ?? 0,
      stationCount: stations.length,
      systems: bikeSystemsOf(stations),
    };
  },
);

/** Lines of every metro system that serves the city. */
export const getMetroLines = cache(
  async (city: City): Promise<MetroLineSummary[]> =>
    (await readMetro(city)).flatMap((data) => data.lines),
);

export const getThsrOverview = cache(
  async (): Promise<ThsrOverview | undefined> => {
    const [stations, fares, timetable] = await Promise.all([
      readThsrStations(),
      attempt('thsr fares', () => cachedThsrFares()),
      attempt('thsr timetable', () => cachedThsrTimetable()),
    ]);

    if (!(stations && fares && timetable)) {
      return undefined;
    }

    return { fares, stations, ...timetable };
  },
);

/** TRA stations located in the city. */
export const getTraStations = cache(
  async (city: City): Promise<StationPoint[]> =>
    ((await readTraStations()) ?? [])
      .filter((station) => station.city === city)
      .map(({ city: _city, ...station }) => station),
);

/** Bus news for the city plus TRA, THSR and the city's metro alerts. */
export const getServiceNotices = cache(
  async (city: City): Promise<ServiceNotice[]> => {
    const groups = await Promise.all([
      supportsBusNews(city)
        ? attempt(`bus news ${city}`, () => cachedBusNews(city))
        : undefined,
      attempt('tra alerts', () => cachedTraAlerts()),
      attempt('thsr alerts', () => cachedThsrAlerts()),
      ...metroSystemsOf(city)
        .filter((system) => system !== 'NTMC')
        .map((system) =>
          attempt(`metro alerts ${system}`, () => cachedMetroAlerts(system)),
        ),
    ]);

    return mergeNotices(groups.filter((group) => group !== undefined));
  },
);

/** Closest stations to a point: at most one per kind, within `maxKm`. */
export const getNearestStations = async (
  position: TransportLatLng,
  city: City,
  maxKm = 3,
): Promise<NearestStation[]> => {
  const [tra, thsr, bike, metro] = await Promise.all([
    readTraStations(),
    readThsrStations(),
    readBikeStations(city),
    readMetro(city),
  ]);

  return nearestStations(
    position,
    [
      ...(tra ?? []),
      ...(thsr ?? []),
      ...(bike ?? []),
      ...metro.flatMap((data) => data.stations),
    ],
    maxKm,
  );
};
