// Pure mapping from TDX transport records to the trimmed shapes the app
// caches and renders. No Next or network imports: unit-tested with bun test.
import type { City } from '@f2e/tdx-core';
import { CityMap } from '@f2e/tdx-core';
import { BUS_APP_URL } from '@/constants/transports';
import { distanceKm } from '@/services/place-mappers';
import type {
  BusRouteItem,
  BusSummary,
  NearestStation,
  ServiceNotice,
  StationKind,
  StationPoint,
  ThsrFareCell,
  TransportLatLng,
} from '@/types/transport';

interface Named {
  Zh_tw?: string | null;
}

interface Point {
  PositionLat?: number | null;
  PositionLon?: number | null;
}

const BUS_SAMPLE_SIZE = 12;
const NOTICE_LIMIT = 8;
const NOTICE_DESCRIPTION_MAX = 160;

const LINE_PREFIX = /^[A-Za-z]+/u;
const POSTAL_PREFIX = /^\d+\s*/u;
const HASH_PREFIX = /^#/u;
const collator = new Intl.Collator('zh-Hant', { numeric: true });

const unique = (values: string[]) => [...new Set(values)];

const positionOf = (point?: Point | null): TransportLatLng | undefined => {
  const lat = point?.PositionLat;
  const lng = point?.PositionLon;

  return typeof lat === 'number' && typeof lng === 'number'
    ? { lat, lng }
    : undefined;
};

// --- bus -------------------------------------------------------------------

export interface BusRouteInput {
  DepartureStopNameZh?: string | null;
  DestinationStopNameZh?: string | null;
  Operators?: { OperatorName?: Named | null }[] | null;
  RouteName?: Named | null;
}

const busRouteHref = (city: City, name: string) =>
  `${BUS_APP_URL}/city/${city}/${encodeURIComponent(name)}`;

export const toBusSummary = (
  city: City,
  routes: BusRouteInput[],
): BusSummary | undefined => {
  const byName = new Map<string, BusRouteItem>();
  const operators: string[] = [];

  for (const route of routes) {
    const name = route.RouteName?.Zh_tw;

    if (!name) {
      continue;
    }

    for (const operator of route.Operators ?? []) {
      if (operator.OperatorName?.Zh_tw) {
        operators.push(operator.OperatorName.Zh_tw);
      }
    }

    if (!byName.has(name)) {
      const { DepartureStopNameZh: from, DestinationStopNameZh: to } = route;

      byName.set(name, {
        headsign: from && to ? `${from} - ${to}` : undefined,
        href: busRouteHref(city, name),
        name,
      });
    }
  }

  if (byName.size === 0) {
    return undefined;
  }

  return {
    operators: unique(operators).sort(collator.compare),
    routeCount: byName.size,
    routes: [...byName.values()]
      .sort((a, b) => collator.compare(a.name, b.name))
      .slice(0, BUS_SAMPLE_SIZE),
  };
};

// --- bike ------------------------------------------------------------------

export interface BikeStationInput {
  ServiceType?: number | null;
  StationID?: string | null;
  StationName?: Named | null;
  StationPosition?: Point | null;
  StationUID?: string | null;
}

/** A trimmed bike station: a StationPoint plus the TDX ServiceType code. */
export interface BikeStationRow extends StationPoint {
  serviceType?: number;
}

const BIKE_SYSTEMS: Record<number, string> = {
  1: 'YouBike 1.0',
  2: 'YouBike 2.0',
  3: 'Moovo',
};

// TDX prefixes names with the system: 「YouBike2.0_捷運公館站」.
const BIKE_NAME_PREFIX = /^YouBike\s?\d(?:\.\d)?_/u;

export const toBikeStationRows = (
  stations: BikeStationInput[],
): BikeStationRow[] => {
  const rows: BikeStationRow[] = [];

  for (const station of stations) {
    const position = positionOf(station.StationPosition);
    const id = station.StationUID ?? station.StationID;
    const rawName = station.StationName?.Zh_tw;

    if (!(position && id && rawName)) {
      continue;
    }

    rows.push({
      id: `bike-${id}`,
      kind: 'Bike',
      name: rawName.replace(BIKE_NAME_PREFIX, ''),
      operator: 'YouBike',
      position,
      serviceType: station.ServiceType ?? undefined,
    });
  }

  return rows;
};

export const bikeSystemsOf = (rows: BikeStationRow[]) =>
  unique(
    rows.flatMap((row) =>
      row.serviceType && BIKE_SYSTEMS[row.serviceType]
        ? [BIKE_SYSTEMS[row.serviceType]]
        : [],
    ),
  ).sort(collator.compare);

/** CyclingLength is in metres; the summary reports km to one decimal. */
export const cyclingKmOf = (
  shapes: { CyclingLength?: number | null }[],
): number => {
  const metres = shapes.reduce(
    (total, shape) =>
      total +
      (shape.CyclingLength && shape.CyclingLength > 0
        ? shape.CyclingLength
        : 0),
    0,
  );

  return Math.round(metres / 100) / 10;
};

// --- THSR ------------------------------------------------------------------

export interface ThsrStationInput {
  StationID: string;
  StationName?: Named | null;
  StationPosition?: Point | null;
}

/** StationID ascends from Nangang (0990) to Zuoying (1070): north to south. */
export const toThsrStations = (stations: ThsrStationInput[]): StationPoint[] =>
  stations
    .flatMap((station) => {
      const position = positionOf(station.StationPosition);
      const name = station.StationName?.Zh_tw;

      return position && name
        ? [
            {
              id: `thsr-${station.StationID}`,
              kind: 'THSR' as const,
              name,
              operator: '高鐵',
              position,
            },
          ]
        : [];
    })
    .sort((a, b) => collator.compare(a.id, b.id));

export interface ThsrOdFareInput {
  DestinationStationID: string;
  Fares?:
    | {
        CabinClass: number;
        FareClass: number;
        Price: number;
        TicketType: number;
      }[]
    | null;
  OriginStationID: string;
}

// TicketType 1 = 一般票(單程票), FareClass 1 = 成人, CabinClass 1 = 標準座車廂.
export const toThsrFares = (odFares: ThsrOdFareInput[]): ThsrFareCell[] =>
  odFares.flatMap((od) => {
    const fare = od.Fares?.find(
      (item) =>
        item.TicketType === 1 && item.FareClass === 1 && item.CabinClass === 1,
    );

    return fare
      ? [
          {
            destinationId: od.DestinationStationID,
            originId: od.OriginStationID,
            price: fare.Price,
          },
        ]
      : [];
  });

export interface ThsrTimetableInput {
  GeneralTimetable: {
    GeneralTrainInfo: { TrainNo: string };
    ServiceDay?: { Monday?: number } | null;
    StopTimes: { DepartureTime?: string | null; StopSequence: number }[];
  };
}

export interface ThsrTimetableSummary {
  firstDeparture?: string;
  lastDeparture?: string;
  trainCount: number;
}

/** A typical (Monday) service day: distinct trains and their origin departures. */
export const toThsrTimetableSummary = (
  timetables: ThsrTimetableInput[],
): ThsrTimetableSummary => {
  const trains = new Set<string>();
  const departures: string[] = [];

  for (const { GeneralTimetable: timetable } of timetables) {
    if (timetable.ServiceDay && timetable.ServiceDay.Monday !== 1) {
      continue;
    }

    trains.add(timetable.GeneralTrainInfo.TrainNo);

    const [origin] = [...timetable.StopTimes].sort(
      (a, b) => a.StopSequence - b.StopSequence,
    );

    if (origin?.DepartureTime) {
      departures.push(origin.DepartureTime);
    }
  }

  departures.sort();

  return {
    firstDeparture: departures[0],
    lastDeparture: departures.at(-1),
    trainCount: trains.size,
  };
};

// --- TRA -------------------------------------------------------------------

export interface TraStationInput {
  StationAddress?: string | null;
  StationID: string;
  StationName?: Named | null;
  StationPosition?: Point | null;
}

export interface TraStationRow extends StationPoint {
  city?: City;
}

const CITY_NAMES = Object.fromEntries(
  Object.entries(CityMap).filter(([key]) => key.length > 3),
) as Record<string, string>;

const normalizeZh = (text: string) => text.replace(/台/gu, '臺');

/**
 * TRA v3 stations carry no city code, only an address that starts with the
 * city or county name (「臺北市中正區…」, sometimes written with 台 and a
 * leading postal code), so match that prefix against the city names.
 */
export const cityOfAddress = (address?: string | null): City | undefined => {
  if (!address) {
    return undefined;
  }

  const text = normalizeZh(address.trim().replace(POSTAL_PREFIX, ''));

  return (Object.keys(CITY_NAMES) as City[]).find((city) =>
    text.startsWith(CITY_NAMES[city]),
  );
};

export const toTraStations = (stations: TraStationInput[]): TraStationRow[] =>
  stations.flatMap((station) => {
    const position = positionOf(station.StationPosition);
    const name = station.StationName?.Zh_tw;

    return position && name
      ? [
          {
            city: cityOfAddress(station.StationAddress),
            id: `tra-${station.StationID}`,
            kind: 'TRA' as const,
            name,
            operator: '台鐵',
            position,
          },
        ]
      : [];
  });

// --- metro -----------------------------------------------------------------

export interface MetroLineInput {
  LineColor?: string | null;
  LineID: string;
  LineName?: Named | null;
  LineNo?: string | null;
}

export interface MetroStationInput {
  StationID: string;
  StationName?: Named | null;
  StationPosition?: Point | null;
}

export const toMetroStations = (
  systemName: string,
  system: string,
  stations: MetroStationInput[],
): StationPoint[] =>
  stations.flatMap((station) => {
    const position = positionOf(station.StationPosition);
    const name = station.StationName?.Zh_tw;

    return position && name
      ? [
          {
            id: `metro-${system}-${station.StationID}`,
            kind: 'Metro' as const,
            name,
            operator: systemName,
            position,
          },
        ]
      : [];
  });

// StationID is the line code plus a number (BL12, R22A, A12, C3).
const linePrefixOf = (stationId: string) => LINE_PREFIX.exec(stationId)?.[0];

/**
 * TDX's station list carries no line, so stationCount counts the stations
 * whose StationID letter prefix equals the LineID (or LineNo). A system with
 * one line (numeric IDs, e.g. 臺中捷運) gets every station.
 */
export const toMetroLines = (
  systemName: string,
  lines: MetroLineInput[],
  stations: { StationID: string }[],
) =>
  lines.flatMap((line) => {
    const codes = [line.LineID, line.LineNo].filter(Boolean) as string[];
    const stationCount =
      lines.length === 1
        ? stations.length
        : stations.filter((station) => {
            const prefix = linePrefixOf(station.StationID);

            return prefix ? codes.includes(prefix) : false;
          }).length;
    const name = line.LineName?.Zh_tw;

    return name
      ? [
          {
            color: line.LineColor
              ? `#${line.LineColor.replace(HASH_PREFIX, '')}`
              : undefined,
            lineId: line.LineID,
            name,
            stationCount,
            systemName,
          },
        ]
      : [];
  });

// --- notices ---------------------------------------------------------------

export interface NoticeInput {
  Description?: string | null;
  EndTime?: string | null;
  id: string;
  PublishTime?: string | null;
  Title: string;
  UpdateTime?: string | null;
  Url?: string | null;
}

const clip = (text?: string | null) => {
  const trimmed = text?.replace(/\s+/gu, ' ').trim();

  if (!trimmed) {
    return;
  }

  return trimmed.length > NOTICE_DESCRIPTION_MAX
    ? `${trimmed.slice(0, NOTICE_DESCRIPTION_MAX)}…`
    : trimmed;
};

const timeOf = (iso?: string) => {
  const time = iso ? Date.parse(iso) : Number.NaN;

  return Number.isNaN(time) ? 0 : time;
};

/** Notices from one source (「公車」「台鐵」…), dropping ones already ended. */
export const toNotices = (
  source: string,
  items: NoticeInput[],
  now = Date.now(),
): ServiceNotice[] =>
  items.flatMap((item) => {
    if (
      !item.Title ||
      (item.EndTime && timeOf(item.EndTime) > 0 && timeOf(item.EndTime) < now)
    ) {
      return [];
    }

    return [
      {
        description: clip(item.Description),
        id: `${source}-${item.id}`,
        publishedAt: item.PublishTime ?? item.UpdateTime ?? undefined,
        source,
        title: item.Title.trim(),
        url: item.Url ?? undefined,
      },
    ];
  });

/** De-duplicates by source + title, newest first, at most `limit`. */
export const mergeNotices = (
  groups: ServiceNotice[][],
  limit = NOTICE_LIMIT,
): ServiceNotice[] => {
  const seen = new Set<string>();
  const merged: ServiceNotice[] = [];

  for (const notice of groups.flat()) {
    const key = `${notice.source}|${notice.title}`;

    if (!seen.has(key)) {
      seen.add(key);
      merged.push(notice);
    }
  }

  return merged
    .sort((a, b) => timeOf(b.publishedAt) - timeOf(a.publishedAt))
    .slice(0, limit);
};

// --- nearest ---------------------------------------------------------------

/** For each kind, the closest station within maxKm; nearest first. */
export const nearestStations = (
  position: TransportLatLng,
  stations: StationPoint[],
  maxKm: number,
): NearestStation[] => {
  const best = new Map<StationKind, NearestStation>();

  for (const station of stations) {
    const km = distanceKm(position, station.position);
    const current = best.get(station.kind);

    if (km <= maxKm && (!current || km < current.distanceKm)) {
      best.set(station.kind, { ...station, distanceKm: km });
    }
  }

  return [...best.values()].sort((a, b) => a.distanceKm - b.distanceKm);
};
