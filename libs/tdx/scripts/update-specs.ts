import { sleep, write } from 'bun';
import { SPEC_URL, SPECS } from './specs';

const MAX_ATTEMPTS = 8;
const BACKOFF_MS = 500;

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

const results = await Promise.allSettled(
  SPECS.map(async ({ id, name }) => {
    const spec = await fetchSpec(id, name);
    const path = new URL(`../specs/${name}.json`, import.meta.url);
    await write(path, `${JSON.stringify(spec, null, 2)}\n`);
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
