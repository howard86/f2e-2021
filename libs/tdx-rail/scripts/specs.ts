import type { TdxSpec } from '@f2e/tdx-core/codegen';

// Spec paths are relative to the server URL declared in each spec
// (https://tdx.transportdata.tw/api/basic); the runtime client overrides it
// with the configured TDX base URL.
export const SPECS: TdxSpec[] = [
  { id: '268fc230-2e04-471b-a728-a726167c1cfc', name: 'rail-basic-v2' },
  { id: '5fa88b0c-120b-43f1-b188-c379ddb2593d', name: 'rail-basic-v3' },
];
