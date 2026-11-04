export const SPEC_URL = 'https://tdx.transportdata.tw/webapi/File/Swagger/V3';

// Spec paths are relative to the server URL declared in each spec
// (https://tdx.transportdata.tw/api/<basic|advanced|tourism>); the runtime
// clients in client.ts override it with the configured TDX base URL.
export const SPECS = [
  { id: '2998e851-81d0-40f5-b26d-77e2f5ac4118', name: 'bus-basic-v2' },
  { id: 'b1b2b02c-b5f3-405f-aff5-7b912b3e8623', name: 'bus-advanced-v2' },
  { id: '2cc9b888-a592-496f-99de-9ab35b7fb70d', name: 'bike-basic-v2' },
  { id: '1a723c95-9edf-4dc9-9892-6cdbab40b7a9', name: 'bike-advanced-v2' },
  { id: '0aed433a-9e95-404d-974c-4e70e29ae460', name: 'tourism-v2' },
];
