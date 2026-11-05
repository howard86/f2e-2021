/// <reference types="bun" />

import { describe, expect, test } from 'bun:test';

import { fixtureRecords, fixtureSnapshot } from './place-fixtures';
import { toSummary } from './place-mappers';

describe('dev fixtures', () => {
  test('a recorded city serves summaries', async () => {
    const records = await fixtureSnapshot('scene', 'Taipei');

    expect(records.length).toBeGreaterThan(0);
    expect(toSummary('scene', records[0]).name).toBeTruthy();
  });

  test('a city without a fixture is empty, not an error', async () => {
    expect(await fixtureSnapshot('scene', 'Chiayi')).toEqual([]);
  });

  test('city-less queries read every recorded city', async () => {
    const all = await fixtureRecords('scene');
    const taipei = await fixtureSnapshot('scene', 'Taipei');

    expect(all.length).toBeGreaterThan(taipei.length);
  });
});
