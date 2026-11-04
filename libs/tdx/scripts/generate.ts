import { generateClients } from '@f2e/tdx-core/codegen';
import { SPECS } from './specs';

await generateClients({
  packageDir: new URL('..', import.meta.url).pathname,
  specs: SPECS,
});
