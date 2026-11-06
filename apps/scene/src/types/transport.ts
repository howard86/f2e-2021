// Shared contract between services/transports.ts (data) and the /transports
// pages and detail-page components (UI). Root-owned: change only by agreement.
export interface TransportLatLng {
  lat: number;
  lng: number;
}

export interface BusRouteItem {
  /** e.g. 「捷運公館站 - 動物園」, from DepartureStopNameZh / DestinationStopNameZh. */
  headsign?: string;
  /** Deep link into the bus app: https://bus.howardism.dev/city/{City}/{routeName}. */
  href: string;
  name: string;
}

export interface BusSummary {
  operators: string[];
  routeCount: number;
  /** A short, stable sample (sorted by name), not the full list. */
  routes: BusRouteItem[];
}

export interface BikeSummary {
  /** Total length of the city's cycling routes, rounded to 0.1 km. */
  cyclingKm: number;
  stationCount: number;
  /** e.g. ['YouBike 1.0', 'YouBike 2.0'], from ServiceType. */
  systems: string[];
}

export type StationKind = 'THSR' | 'TRA' | 'Metro' | 'Bike';

export interface StationPoint {
  id: string;
  kind: StationKind;
  name: string;
  /** Display operator, e.g. 「高鐵」「台鐵」「臺北捷運」「YouBike」. */
  operator: string;
  position: TransportLatLng;
}

export interface MetroLineSummary {
  /** Hex colour from TDX LineColor, with a leading '#', when present. */
  color?: string;
  lineId: string;
  name: string;
  stationCount: number;
  /** Display system name, e.g. 「臺北捷運」. */
  systemName: string;
}

export interface ThsrFareCell {
  destinationId: string;
  originId: string;
  /** Standard (標準車廂) adult fare, NTD. */
  price: number;
}

export interface ThsrOverview {
  /** Adult standard-car fares between every station pair present in ODFare. */
  fares: ThsrFareCell[];
  /** Daily trains in the general timetable and the earliest/latest departures (HH:mm). */
  firstDeparture?: string;
  lastDeparture?: string;
  /** Stations in north→south order. */
  stations: StationPoint[];
  trainCount: number;
}

export interface ServiceNotice {
  description?: string;
  id: string;
  publishedAt?: string;
  /** 「公車」「台鐵」「高鐵」「臺北捷運」… */
  source: string;
  title: string;
  url?: string;
}

export interface NearestStation extends StationPoint {
  distanceKm: number;
}
