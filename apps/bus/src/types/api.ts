import type { City } from '@f2e/tdx-core';

export interface SuccessApiResponse<T> {
  data: T;
  success: true;
}

export interface ErrorApiResponse {
  message: string;
  success: false;
}

export interface BusEstimationParam {
  city: City;
  route: string;
}

export interface StationQueryParam {
  lat: string;
  lng: string;
}
