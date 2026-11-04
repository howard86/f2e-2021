import { createClient } from '@hey-api/openapi-ts';
import { file } from 'bun';
import { SPECS } from './specs';

interface Spec {
  components?: { schemas?: Record<string, unknown> };
}

// Some TDX builds declare a component schema as `null` (seen in
// bus-advanced-v2), which crashes the generator with "schema is not an
// Object". An empty schema means "any", so use that in memory and keep the
// committed spec byte-for-byte what TDX served.
function fillNullSchemas(spec: Spec) {
  const schemas = spec.components?.schemas ?? {};
  for (const [key, schema] of Object.entries(schemas)) {
    if (schema === null) {
      schemas[key] = {};
    }
  }
  return spec;
}

// Jobs run one at a time: generating several specs concurrently in one
// process fails with "Cannot use 'in' operator to search for '$ref' in null".
// Specs are read from the committed copies in specs/ (see update-specs.ts).
for (const { name } of SPECS) {
  // biome-ignore lint/performance/noAwaitInLoops: specs must be generated sequentially.
  const raw = await file(
    new URL(`../specs/${name}.json`, import.meta.url),
  ).json();
  const spec = fillNullSchemas(raw);
  await createClient({
    input: spec,
    output: { path: `generated/${name}` },
    plugins: ['@hey-api/typescript', '@hey-api/sdk', '@hey-api/client-fetch'],
  });
}
