/// <reference types="bun" />

import { describe, expect, test } from 'bun:test';

import { getPeriodLabel, mapWeatherLocations } from './weather';

const time = (startTime: string, endTime: string, parameterName: string) => ({
  endTime,
  parameter: { parameterName },
  startTime,
});

describe('getPeriodLabel', () => {
  const noon = new Date('2026-11-05T04:00:00Z');

  test('labels day and night periods relative to today', () => {
    expect(getPeriodLabel('2026-11-04T22:00:00.000Z', noon)).toBe('今日白天');
    expect(getPeriodLabel('2026-11-05T10:00:00.000Z', noon)).toBe('今晚明晨');
    expect(getPeriodLabel('2026-11-05T22:00:00.000Z', noon)).toBe('明日白天');
  });

  test('a night period that began yesterday is still tonight', () => {
    const early = new Date('2026-11-04T19:00:00Z');

    expect(getPeriodLabel('2026-11-04T10:00:00.000Z', early)).toBe('今晚明晨');
  });
});

describe('mapWeatherLocations', () => {
  test('maps periods per city and tolerates missing elements', () => {
    const [city] = mapWeatherLocations(
      [
        {
          locationName: '臺北市',
          weatherElement: [
            {
              elementName: 'Wx',
              time: [
                time('2026-11-05 06:00:00', '2026-11-05 18:00:00', '多雲'),
                time('2026-11-05 18:00:00', '2026-11-06 06:00:00', '晴'),
              ],
            },
            {
              elementName: 'MinT',
              time: [
                time('2026-11-05 06:00:00', '2026-11-05 18:00:00', '20'),
                time('2026-11-05 18:00:00', '2026-11-06 06:00:00', '18'),
              ],
            },
            {
              elementName: 'MaxT',
              time: [
                time('2026-11-05 06:00:00', '2026-11-05 18:00:00', '26'),
                time('2026-11-05 18:00:00', '2026-11-06 06:00:00', '22'),
              ],
            },
          ],
        },
      ],
      new Date('2026-11-05T02:00:00Z'),
    );

    expect(city.city).toBe('臺北市');
    expect(city.minT).toBe('20');
    expect(city.maxT).toBe('26');
    expect(city.weather).toBe('多雲');
    expect(city.periods).toHaveLength(2);
    expect(city.periods[0]).toMatchObject({
      label: '今日白天',
      pop: undefined,
      start: '2026-11-04T22:00:00.000Z',
    });
    expect(city.periods[1].label).toBe('今晚明晨');
  });
});
