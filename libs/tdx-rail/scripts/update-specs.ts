import { updateSpecs } from '@f2e/tdx-core/codegen';
import { SPECS } from './specs';

await updateSpecs({
  packageDir: new URL('..', import.meta.url).pathname,
  specs: SPECS,
});
