import type { BusDirection, BusStopOfRoute } from '@f2e/tdx-bus';

export type RouteStopEntity = Record<BusDirection, BusStopOfRoute>;

/** Name of the stop a direction heads to (its last stop). */
export const getDirectionDestination = (
  routeStopEntity: RouteStopEntity,
  direction: BusDirection,
): string =>
  routeStopEntity[direction]?.Stops.at(-1)?.StopName.Zh_tw ??
  Object.values(routeStopEntity)[0]?.Stops.at(-1)?.StopName.Zh_tw ??
  '';

/** Tab label: a single-direction route shows its first stop, else its destination. */
export const getDirectionTabName = (
  routeStopEntity: RouteStopEntity,
  directions: BusDirection[],
  direction: BusDirection,
): string =>
  directions.length === 1
    ? routeStopEntity[direction].Stops[0].StopName.Zh_tw
    : getDirectionDestination(routeStopEntity, direction);
