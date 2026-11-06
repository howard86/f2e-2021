// Refreshes src/data/transport-snapshot.json: the near-static TDX rail
// datasets (THSR, TRA, metro) and per-city cycling lengths that the
// /transports pages read at request time without calling TDX.
//
//   cd apps/scene && bun run update-transport-snapshot
//
// Calls run one at a time, paced under TDX's 5 requests a minute (~8 minutes).
// Any failure aborts the run and leaves the committed file untouched.
import { existsSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { BikeService } from '@f2e/tdx-bike';
import { CitySet, resolveTdxCredentials, TdxService } from '@f2e/tdx-core';
import { type MetroSystem, RailService } from '@f2e/tdx-rail';

import {
  METRO_SYSTEM_NAMES,
  supportsCyclingData,
} from '@/constants/transports';
import {
  cyclingKmOf,
  toMetroLines,
  toMetroStations,
  toThsrFares,
  toThsrStations,
  toThsrTimetableSummary,
  toTraStations,
} from '@/services/transport-mappers';
import type { TransportSnapshot } from '@/services/transport-snapshot';

const rootEnvFile = join(import.meta.dirname, '../../../.env.local');
if (existsSync(rootEnvFile)) {
  process.loadEnvFile(rootEnvFile);
}

const OUTPUT = join(import.meta.dirname, '../src/data/transport-snapshot.json');
const NO_FILTER = { top: 5000 };
const SYSTEMS = Object.keys(METRO_SYSTEM_NAMES).sort() as MetroSystem[];

const tdx = new TdxService(resolveTdxCredentials(process.env), {
  minRequestIntervalMs: 13_000,
});
const rail = new RailService(tdx);
const bike = new BikeService(tdx);

const step = async <T>(label: string, run: () => Promise<T>) => {
  console.log(`fetching ${label}`);
  return await run();
};

const main = async () => {
  const thsrStations = toThsrStations(
    await step('THSR stations', () => rail.getThsrStations()),
  );
  const fares = toThsrFares(
    await step('THSR fares', () => rail.getThsrODFares(NO_FILTER)),
  );
  const timetable = toThsrTimetableSummary(
    await step('THSR timetable', () => rail.getThsrGeneralTimetable(NO_FILTER)),
  );
  const traStations = toTraStations(
    await step('TRA stations', () => rail.getTraStations()),
  );

  const metro: TransportSnapshot['metro'] = {};
  for (const system of SYSTEMS) {
    const name = METRO_SYSTEM_NAMES[system];
    // biome-ignore lint/performance/noAwaitInLoops: TDX allows 5 requests a minute, so calls run one at a time
    const lines = await step(`${system} lines`, () =>
      rail.getMetroLines(system, NO_FILTER),
    );
    const stations = await step(`${system} stations`, () =>
      rail.getMetroStations(system, NO_FILTER),
    );
    metro[system] = {
      lines: toMetroLines(name, lines, stations),
      stations: toMetroStations(name, system, stations),
    };
  }

  const cyclingKm: Record<string, number> = {};
  for (const city of [...CitySet].sort()) {
    if (supportsCyclingData(city)) {
      cyclingKm[city] = cyclingKmOf(
        // biome-ignore lint/performance/noAwaitInLoops: sequential on purpose (rate limit)
        await step(`cycling ${city}`, () =>
          bike.getCyclingShapeByCity(city, {
            select: 'CyclingLength',
            ...NO_FILTER,
          }),
        ),
      );
    }
  }

  const snapshot: TransportSnapshot = {
    cyclingKm,
    generatedAt: new Date().toISOString(),
    metro,
    thsr: { fares, stations: thsrStations, ...timetable },
    traStations,
  };

  await writeFile(OUTPUT, `${JSON.stringify(snapshot, null, 2)}\n`);
  console.log(`wrote ${OUTPUT}`);
};

main().catch((error) => {
  console.error('snapshot failed, nothing written', error);
  process.exit(1);
});
