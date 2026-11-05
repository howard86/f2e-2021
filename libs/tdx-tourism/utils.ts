import type { TourismPropertyType } from './tourism';

const SCENE_KEYWORDS = [
  'Description',
  'AttractionName',
  'Remarks',
  'TrafficInfo',
  'FeeInfo',
  'PostalAddress/StreetAddress',
];

const RESTAURANT_KEYWORDS = [
  'RestaurantName',
  'Description',
  'PostalAddress/StreetAddress',
  'ServiceTimeInfo',
  'PostalAddress/City',
  'ParkingInfo',
];

const HOTEL_KEYWORDS = [
  'PostalAddress/StreetAddress',
  'PostalAddress/City',
  'Description',
  'HotelName',
  'ParkingInfo',
  'ServiceInfo',
  'RoomInfo',
];

const ACTIVITY_KEYWORDS = [
  'EventName',
  'Description',
  'Participant',
  'PostalAddress/StreetAddress',
  'StartDateTime',
  'EndDateTime',
  'PostalAddress/City',
  'ParkingInfo',
  'FeeInfo',
  'TrafficInfo',
];

const getODataSearchCriteria = (keyword: string, value: string) =>
  `indexof(${keyword}, '${value}') gt -1`;

const OR_STATEMENT = ' or ';

export const constructScenesSearch = (value: string): string =>
  SCENE_KEYWORDS.map((keyword) => getODataSearchCriteria(keyword, value)).join(
    OR_STATEMENT,
  );

export const constructRestaurantsSearch = (value: string): string =>
  RESTAURANT_KEYWORDS.map((keyword) =>
    getODataSearchCriteria(keyword, value),
  ).join(OR_STATEMENT);

export const constructHotelsSearch = (value: string): string =>
  HOTEL_KEYWORDS.map((keyword) => getODataSearchCriteria(keyword, value)).join(
    OR_STATEMENT,
  );

export const constructActivitiesSearch = (value: string): string =>
  ACTIVITY_KEYWORDS.map((keyword) =>
    getODataSearchCriteria(keyword, value),
  ).join(OR_STATEMENT);

const NAME_FIELDS: Record<TourismPropertyType, string> = {
  Activity: 'EventName',
  Hotel: 'HotelName',
  Restaurant: 'RestaurantName',
  ScenicSpot: 'AttractionName',
};

/**
 * Keyword match on a V2 record's name or description, for the native V2
 * getters. Unlike the construct*Search helpers it avoids date and address
 * fields, which TDX rejects or makes slow under `indexof`.
 */
export const constructKeywordFilter = (
  type: TourismPropertyType,
  keyword: string,
): string => {
  const value = keyword.replaceAll("'", "''");

  return [NAME_FIELDS[type], 'Description']
    .map((field) => getODataSearchCriteria(field, value))
    .join(OR_STATEMENT);
};
