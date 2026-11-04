import type { TdxSpec } from '@f2e/tdx-core/codegen';

// Spec paths are relative to the server URL declared in each spec
// (https://tdx.transportdata.tw/api/<basic|advanced|tourism>); the runtime
// clients in client.ts override it with the configured TDX base URL.
export const SPECS: TdxSpec[] = [
  { id: '2cc9b888-a592-496f-99de-9ab35b7fb70d', name: 'bike-basic-v2' },
  { id: '1a723c95-9edf-4dc9-9892-6cdbab40b7a9', name: 'bike-advanced-v2' },
];
