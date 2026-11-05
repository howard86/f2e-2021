import type { GeoJSONMultiLineString } from 'wellknown';

export const roundTo = (value: number, decimals: number) => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

/** Rounds every coordinate component; 5 decimals is about 1m. */
export const roundGeoJson = (
  geoJson: GeoJSONMultiLineString,
  decimals = 5,
): GeoJSONMultiLineString => ({
  ...geoJson,
  coordinates: geoJson.coordinates.map((line) =>
    line.map(
      (position) =>
        position.map((v) => roundTo(v, decimals)) as typeof position,
    ),
  ),
});

/**
 * Pairs each station with its availability by StationUID and keeps the
 * stations in service. The two TDX nearby endpoints are separate queries, so
 * their order and length are not guaranteed to match.
 */
export const mergeStationAvailability = <
  S extends { StationUID?: string },
  B extends { ServiceStatus?: number; StationUID?: string },
>(
  stations: S[],
  bikes: B[],
) => {
  const bikesByUid = new Map(bikes.map((bike) => [bike.StationUID, bike]));
  const merged: { entities: Record<string, S & B>; uids: string[] } = {
    entities: {},
    uids: [],
  };

  for (const station of stations) {
    const uid = station.StationUID;
    const bike = uid === undefined ? undefined : bikesByUid.get(uid);

    if (uid !== undefined && bike?.ServiceStatus === 1) {
      merged.uids.push(uid);
      merged.entities[uid] = { ...station, ...bike };
    }
  }

  return merged;
};

export const CyclingDifficulty = {
  EASY: 1,
  EXPERT: 4,
  HARD: 3,
  MEDIUM: 2,
  UNKNOWN: 0,
} as const;

export type CyclingDifficulty =
  (typeof CyclingDifficulty)[keyof typeof CyclingDifficulty];

export const getDifficulty = (meter?: number): CyclingDifficulty => {
  if (!meter) {
    return CyclingDifficulty.UNKNOWN;
  }

  if (meter < 3000) {
    return CyclingDifficulty.EASY;
  }

  if (meter < 8000) {
    return CyclingDifficulty.MEDIUM;
  }

  if (meter < 17_000) {
    return CyclingDifficulty.HARD;
  }

  return CyclingDifficulty.EXPERT;
};
