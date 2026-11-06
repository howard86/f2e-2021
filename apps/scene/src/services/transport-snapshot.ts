// Typed reader for src/data/transport-snapshot.json, the near-static rail
// datasets and cycling lengths written by scripts/update-transport-snapshot.ts.
import type { MetroSystem } from '@f2e/tdx-rail';

import snapshotJson from '@/data/transport-snapshot.json';
import type { TraStationRow } from '@/services/transport-mappers';
import type {
  MetroLineSummary,
  StationPoint,
  ThsrOverview,
} from '@/types/transport';

export interface TransportSnapshot {
  /** Km of cycling routes per city, rounded to 0.1 km. */
  cyclingKm: Record<string, number>;
  generatedAt: string;
  metro: Partial<
    Record<MetroSystem, { lines: MetroLineSummary[]; stations: StationPoint[] }>
  >;
  thsr: ThsrOverview;
  traStations: TraStationRow[];
}

export const transportSnapshot = snapshotJson as TransportSnapshot;
