import { createClient } from '@hey-api/openapi-ts';
import { file, sleep, write } from 'bun';

export interface TdxSpec {
  id: string;
  name: string;
}

interface CodegenOptions {
  packageDir: string;
  specs: TdxSpec[];
}

interface Spec {
  components?: { schemas?: Record<string, unknown> };
}

export const SPEC_URL = 'https://tdx.transportdata.tw/webapi/File/Swagger/V3';

const MAX_ATTEMPTS = 8;
const BACKOFF_MS = 500;

const dirPath = (packageDir: string) =>
  packageDir.endsWith('/') ? packageDir : `${packageDir}/`;

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
// Specs are read from the committed copies in specs/ (see updateSpecs).
export async function generateClients({
  specs,
  packageDir,
}: CodegenOptions): Promise<void> {
  const dir = dirPath(packageDir);
  for (const { name } of specs) {
    // biome-ignore lint/performance/noAwaitInLoops: specs must be generated sequentially.
    const raw = await file(`${dir}specs/${name}.json`).json();
    const spec = fillNullSchemas(raw);
    await createClient({
      input: spec,
      output: { path: `${dir}generated/${name}` },
      plugins: ['@hey-api/typescript', '@hey-api/sdk', '@hey-api/client-fetch'],
    });
  }
}

// TDX's Swagger endpoint intermittently answers 200 with an empty body, so a
// response only counts when it is a usable OpenAPI document.
function parseSpec(text: string): unknown {
  if (text.trim() === '') {
    throw new Error('empty body');
  }
  const json = JSON.parse(text) as {
    openapi?: unknown;
    paths?: Record<string, unknown>;
  };
  if (typeof json.openapi !== 'string') {
    throw new Error('missing "openapi" version string');
  }
  if (
    typeof json.paths !== 'object' ||
    json.paths === null ||
    Object.keys(json.paths).length === 0
  ) {
    throw new Error('missing or empty "paths"');
  }
  return json;
}

async function fetchSpec(id: string, name: string): Promise<unknown> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      // biome-ignore lint/performance/noAwaitInLoops: retries are sequential.
      const response = await fetch(`${SPEC_URL}/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return parseSpec(await response.text());
    } catch (error) {
      lastError = error;
      console.warn(
        `${name}: attempt ${attempt}/${MAX_ATTEMPTS} failed:`,
        error,
      );
      await sleep(BACKOFF_MS * attempt);
    }
  }
  throw new Error(`${name}: no valid spec after ${MAX_ATTEMPTS} attempts`, {
    cause: lastError,
  });
}

export async function updateSpecs({
  specs,
  packageDir,
}: CodegenOptions): Promise<void> {
  const dir = dirPath(packageDir);
  const results = await Promise.allSettled(
    specs.map(async ({ id, name }) => {
      const spec = await fetchSpec(id, name);
      await write(
        `${dir}specs/${name}.json`,
        `${JSON.stringify(spec, null, 2)}\n`,
      );
      console.log(`${name}: updated`);
    }),
  );

  const failed = results.filter((result) => result.status === 'rejected');
  if (failed.length > 0) {
    for (const result of failed) {
      console.error((result as PromiseRejectedResult).reason);
    }
    process.exit(1);
  }
}
