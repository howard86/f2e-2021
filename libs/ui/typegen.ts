// Source for `chakra typegen` (see package.json). Typegen writes into the
// installed @chakra-ui/react package, which bun links once for every app, so
// per-app typegen would overwrite each other. Generate once from all three
// apps' configs merged instead: each app gets types for its own tokens and
// recipes, plus the other apps' (harmless). Types only; nothing imports this
// at runtime.
import { config as bus } from '../../apps/bus/src/theme';
import { config as scene } from '../../apps/scene/src/theme';
import { config as ubike } from '../../apps/ubike/src/theme';
import { createAppSystem } from './system';

export default createAppSystem(bus, scene, ubike);
