// Transport data for the /transports pages and place details, in two parts.
// Snapshot (no TDX call at request time): THSR, TRA and metro stations, lines
// and fares, plus per-city cycling lengths, read from
// src/data/transport-snapshot.json. They barely change; refresh the file with
// `bun run update-transport-snapshot` (paced, ~8 minutes) and commit it.
// Live (TDX allows 5 requests a minute): bus routes and bike stations are
// cached for a day per city, bus news per city and the national TRA and THSR
// alerts for an hour, with unstable_cache. Only trimmed, mapped values are
// cached (Vercel drops entries over 2 MB). A fetch failure throws inside the
// cached function, so it is never cached, and is caught outside: the section
// degrades instead of the page.
import type { City } from '@f2e/tdx-core';
import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import {
  metroSystemsOf,
  supportsBikeData,
  supportsBusNews,
} from '@/constants/transports';
import { bikeService, busService, railService } from '@/services/tdx';
import {
  type BikeStationRow,
  bikeSystemsOf,
  mergeNotices,
  nearestStations,
  toBikeStationRows,
  toBusSummary,
  toNotices,
} from '@/services/transport-mappers';
import { transportSnapshot } from '@/services/transport-snapshot';
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
const MAX_ROWS = 5000;
const NO_FILTER = { top: MAX_ROWS };

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

// --- public API -----------------------------------------------------------------

export const getBusSummary = cache(
  async (city: City): Promise<BusSummary | undefined> =>
    (await attempt(`bus ${city}`, () => cachedBusSummary(city))) ?? undefined,
);

export const getBikeSummary = cache(
  async (city: City): Promise<BikeSummary | undefined> => {
    const stations = await readBikeStations(city);

    // Stations are the headline number: without them there is no summary.
    if (!stations) {
      return undefined;
    }

    return {
      cyclingKm: transportSnapshot.cyclingKm[city] ?? 0,
      stationCount: stations.length,
      systems: bikeSystemsOf(stations),
    };
  },
);

/** Lines of every metro system that serves the city. */
export const getMetroLines = cache(
  async (city: City): Promise<MetroLineSummary[]> =>
    metroSystemsOf(city).flatMap(
      (system) => transportSnapshot.metro[system]?.lines ?? [],
    ),
);

export const getThsrOverview = cache(
  async (): Promise<ThsrOverview | undefined> => transportSnapshot.thsr,
);

/** TRA stations located in the city. */
export const getTraStations = cache(
  async (city: City): Promise<StationPoint[]> =>
    transportSnapshot.traStations
      .filter((station) => station.city === city)
      .map(({ city: _city, ...station }) => station),
);

/** Bus news for the city plus the national TRA and THSR alerts. */
export const getServiceNotices = cache(
  async (city: City): Promise<ServiceNotice[]> => {
    const groups = await Promise.all([
      supportsBusNews(city)
        ? attempt(`bus news ${city}`, () => cachedBusNews(city))
        : undefined,
      attempt('tra alerts', () => cachedTraAlerts()),
      attempt('thsr alerts', () => cachedThsrAlerts()),
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
  const bike = await readBikeStations(city);

  return nearestStations(
    position,
    [
      ...transportSnapshot.traStations,
      ...transportSnapshot.thsr.stations,
      ...(bike ?? []),
      ...metroSystemsOf(city).flatMap(
        (system) => transportSnapshot.metro[system]?.stations ?? [],
      ),
    ],
    maxKm,
  );
};
