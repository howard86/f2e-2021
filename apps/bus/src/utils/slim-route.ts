import type { BusDirection, BusStopOfRoute } from '@f2e/tdx-bus';
import type { GeoJSONLineString } from 'wellknown';

type FullStop = BusStopOfRoute['Stops'][number];

export interface SlimStop {
  StopName: Pick<FullStop['StopName'], 'Zh_tw'>;
  StopPosition: Pick<FullStop['StopPosition'], 'PositionLat' | 'PositionLon'>;
  StopSequence: FullStop['StopSequence'];
  StopUID: FullStop['StopUID'];
}

export type SlimRouteStopEntity = Record<BusDirection, { Stops: SlimStop[] }>;

const COORDINATE_FACTOR = 1e6;

const roundCoordinate = (value: number) =>
  Math.round(value * COORDINATE_FACTOR) / COORDINATE_FACTOR;

/** Keeps only the stop fields the client view reads. */
export const slimRouteStops = (
  route: Pick<BusStopOfRoute, 'Stops'>,
): { Stops: SlimStop[] } => ({
  Stops: route.Stops.map((stop) => ({
    StopName: { Zh_tw: stop.StopName.Zh_tw },
    StopPosition: {
      PositionLat: stop.StopPosition.PositionLat,
      PositionLon: stop.StopPosition.PositionLon,
    },
    StopSequence: stop.StopSequence,
    StopUID: stop.StopUID,
  })),
});

/** Rounds shape coordinates to 6 decimals (about 0.1 m). */
export const roundGeoJson = (
  geoJson: GeoJSONLineString,
): GeoJSONLineString => ({
  ...geoJson,
  coordinates: geoJson.coordinates.map(
    (position) => position.map(roundCoordinate) as typeof position,
  ),
});
