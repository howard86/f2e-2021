/// <reference types="bun" />

import { describe, expect, test } from 'bun:test';
import { toODataQuery } from '@f2e/tdx-core';

import { escapeODataString } from './bus';

describe('escapeODataString', () => {
  test('leaves ordinary route names unchanged', () => {
    expect(escapeODataString('307')).toBe('307');
    expect(escapeODataString('紅2')).toBe('紅2');
  });

  test('doubles single quotes so the literal cannot be closed early', () => {
    const name = "x' or RouteName/Zh_tw ne '";
    const { $filter } = toODataQuery({
      filter: `RouteName/Zh_tw eq '${escapeODataString(name)}'`,
    });

    expect($filter).toBe("RouteName/Zh_tw eq 'x'' or RouteName/Zh_tw ne '''");
  });
});
