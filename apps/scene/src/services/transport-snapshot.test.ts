import { describe, expect, it } from 'bun:test';

import {
  METRO_SYSTEM_NAMES,
  supportsCyclingData,
} from '@/constants/transports';
import { transportSnapshot } from '@/services/transport-snapshot';

describe('transport snapshot', () => {
  it('has a generation time', () => {
    expect(Number.isNaN(Date.parse(transportSnapshot.generatedAt))).toBe(false);
  });

  it('lists the THSR stations and fares', () => {
    expect(transportSnapshot.thsr.stations).toHaveLength(12);
    expect(transportSnapshot.thsr.fares.length).toBeGreaterThan(0);
    expect(transportSnapshot.thsr.trainCount).toBeGreaterThan(0);
  });

  it('lists TRA stations, each with a city', () => {
    const { traStations } = transportSnapshot;

    expect(traStations.length).toBeGreaterThan(200);
    expect(traStations.every((station) => station.city)).toBe(true);
  });

  it('has lines and stations for every metro system', () => {
    for (const system of Object.keys(METRO_SYSTEM_NAMES)) {
      const data =
        transportSnapshot.metro[system as keyof typeof METRO_SYSTEM_NAMES];

      expect(data?.lines.length).toBeGreaterThan(0);
      expect(data?.stations.length).toBeGreaterThan(0);
    }
  });

  it('has a cycling length for every city with cycling data', () => {
    const cities = Object.keys(transportSnapshot.cyclingKm);

    expect(cities).toHaveLength(20);
    expect(cities.every((city) => supportsCyclingData(city as never))).toBe(
      true,
    );
  });
});
