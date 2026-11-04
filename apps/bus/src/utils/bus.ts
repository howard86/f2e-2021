import { type BusEstimation, type BusRoute, BusStopStatus } from '@f2e/tdx-bus';

import { getMinute } from './string';

export const getBusRouteDestinations = (busRoute: BusRoute): string => {
  if (!busRoute.DepartureStopNameZh) {
    return busRoute.DestinationStopNameZh;
  }

  if (!busRoute.DestinationStopNameZh) {
    return busRoute.DepartureStopNameZh;
  }

  if (busRoute.DepartureStopNameZh === busRoute.DestinationStopNameZh) {
    return busRoute.DepartureStopNameZh;
  }

  return `${busRoute.DepartureStopNameZh}-${busRoute.DestinationStopNameZh}`;
};

export const getSubRouteTime = (
  firstTime?: string,
  lastTime?: string,
): string => (firstTime && lastTime ? `${firstTime}-${lastTime}` : '無標註');

export const getBusEstimationStatus = (
  busEstimation?: BusEstimation,
): string => {
  if (!busEstimation) {
    return '未知';
  }

  switch (busEstimation.StopStatus) {
    case BusStopStatus.今日未營運:
      return '今日未營運';

    case BusStopStatus.末班車已過:
      return '末班車已過';

    case BusStopStatus.交管不停靠:
      return '交管不停靠';

    case BusStopStatus.尚未發車:
      return busEstimation.EstimateTime
        ? `${getMinute(busEstimation.EstimateTime)}分`
        : '尚未發車';

    case BusStopStatus.正常:
      return busEstimation.EstimateTime < 90
        ? '進站中'
        : `${getMinute(busEstimation.EstimateTime)}分`;

    default:
      return '未知';
  }
};
