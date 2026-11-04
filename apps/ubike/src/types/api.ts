import type {
  BikeAvailability,
  BikeStation,
  CyclingShape,
} from '@f2e/tdx-bike';
import type { GeoJSONMultiLineString } from 'wellknown';

export interface SuccessApiResponse<T> {
  data: T;
  success: true;
}

export interface ErrorApiResponse {
  message: string;
  success: false;
}

export interface BikeCyclingWithGeoJson extends Omit<CyclingShape, 'Geometry'> {
  geoJson: GeoJSONMultiLineString;
}

interface BikeAvailableStation extends BikeStation, BikeAvailability {}

export interface NormalisedBikeStation {
  entities: Record<string, BikeAvailableStation>;
  uids: string[];
}

export interface StationQueryParam {
  lat: string;
  lng: string;
  r: string;
}
