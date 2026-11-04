import type { TdxSpec } from '@f2e/tdx-core/codegen';

// Spec paths are relative to the server URL declared in each spec
// (https://tdx.transportdata.tw/api/<basic|advanced|tourism>); the runtime
// clients in client.ts override it with the configured TDX base URL.
export const SPECS: TdxSpec[] = [
  { id: '2998e851-81d0-40f5-b26d-77e2f5ac4118', name: 'bus-basic-v2' },
  { id: 'b1b2b02c-b5f3-405f-aff5-7b912b3e8623', name: 'bus-advanced-v2' },
];
