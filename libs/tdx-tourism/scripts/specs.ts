import type { TdxSpec } from '@f2e/tdx-core/codegen';

// Spec paths are relative to the server URL declared in each spec
// (https://tdx.transportdata.tw/api/tourism); the runtime client overrides it
// with the configured TDX base URL.
export const SPECS: TdxSpec[] = [
  { id: '0aed433a-9e95-404d-974c-4e70e29ae460', name: 'tourism-v2' },
];
