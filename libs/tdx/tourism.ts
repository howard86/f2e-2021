import {
  type ApiParam,
  type City,
  CityMap,
  TdxService,
  toODataQuery,
} from '@f2e/tdx-core';
import {
  type Attraction,
  type Event,
  tourism0101,
  tourism0201,
  tourism0301,
  tourism0701,
  type Hotel as V2Hotel,
  type Restaurant as V2Restaurant,
} from './generated/tourism-v2';
import { createClient, createConfig } from './generated/tourism-v2/client';

export interface ScenicSpot extends TourismCommonProperty {
  Class1: string;
  Class2: string;
  Class3: string;
  DescriptionDetail?: string;
  Keyword: string;
  Level: string;
  OpenTime: string;
  ParkingPosition: Partial<{
    PositionLon: number;
    PositionLat: number;
    GeoHash: string;
  }>;
  Remarks: string;
  ScenicSpotID: string;
  ScenicSpotName: string;
  TicketInfo: string;
  TravelInfo?: string;
  ZipCode: string;
}

export interface Restaurant extends TourismCommonProperty {
  Class: string;
  OpenTime: string;
  RestaurantID: string;
  RestaurantName: string;
  ZipCode: string;
}

export interface Hotel extends TourismCommonProperty {
  Class: string;
  Fax: string;
  Grade: string;
  HotelID: string;
  HotelName: string;
  ServiceInfo?: string;
  Spec?: string;
  ZipCode: string;
}

export interface Activity extends TourismCommonProperty {
  ActivityID: string;
  ActivityName: string;
  Charge: string;
  Class1: string;
  Class2: string;
  Cycle: string;
  EndTime?: string;
  Location: string;
  NonCycle: string;
  Organizer: string;
  ParkingInfo: string;
  Particpation: string;
  Remarks: string;
  SrcUpdateTime: string;
  StartTime?: string;
  TravelInfo?: string;
  UpdateTime: string;
}

export interface TourismCommonProperty {
  // TDX omits these fields from otherwise valid records at runtime.
  Address?: string;
  City: string;
  Description?: string;
  MapUrl?: string;
  ParkingInfo?: string;
  Phone?: string;
  Picture?: {
    PictureUrl1: string;
    PictureDescription1?: string;
    PictureUrl2?: string;
    PictureDescription2?: string;
    PictureUrl3?: string;
    PictureDescription3?: string;
  };
  Position?: Partial<{
    PositionLon: number;
    PositionLat: number;
    GeoHash: string;
  }>;
  SrcUpdateTime?: string;
  UpdateTime: string;
  WebsiteUrl?: string;
}

export type TourismPropertyType =
  | 'ScenicSpot'
  | 'Restaurant'
  | 'Hotel'
  | 'Activity';

type TourismV2PropertyType = 'Attraction' | 'Restaurant' | 'Hotel' | 'Event';

type TourismV2Item = Partial<Attraction> &
  Partial<Event> &
  Partial<V2Hotel> &
  Partial<V2Restaurant>;

const V2_TYPE_MAP: Record<TourismPropertyType, TourismV2PropertyType> = {
  Activity: 'Event',
  Hotel: 'Hotel',
  Restaurant: 'Restaurant',
  ScenicSpot: 'Attraction',
};

const V2_OPERATIONS = {
  Activity: tourism0701,
  Hotel: tourism0301,
  Restaurant: tourism0201,
  ScenicSpot: tourism0101,
};

const mapClasses = (classes?: number[]) =>
  classes?.map(String).join(', ') || '';

const mapPicture = (images?: TourismV2Item['Images']) => {
  const [first, second, third] = images?.filter((image) => image.URL) || [];

  if (!first?.URL) {
    return;
  }

  return {
    PictureDescription1: first.Description || first.Name || '',
    PictureUrl1: first.URL,
    ...(second?.URL
      ? {
          PictureDescription2: second.Description || second.Name || '',
          PictureUrl2: second.URL,
        }
      : {}),
    ...(third?.URL
      ? {
          PictureDescription3: third.Description || third.Name || '',
          PictureUrl3: third.URL,
        }
      : {}),
  };
};

const mapCommonProperty = (item: TourismV2Item): TourismCommonProperty => {
  const picture = mapPicture(item.Images);
  const position =
    item.PositionLat !== undefined && item.PositionLon !== undefined
      ? {
          PositionLat: item.PositionLat,
          PositionLon: item.PositionLon,
        }
      : undefined;
  const telephone = item.Telephones?.[0];

  return {
    Address:
      [
        item.PostalAddress?.City,
        item.PostalAddress?.Town,
        item.PostalAddress?.StreetAddress,
      ]
        .filter(Boolean)
        .join('') || '',
    City: item.PostalAddress?.City || item.LocatedCities?.[0]?.City || '',
    Description: item.Description || '',
    MapUrl: item.MapURLs?.[0] || '',
    ParkingInfo: item.ParkingInfo || '',
    Phone: telephone?.Tel
      ? `${telephone.Tel}${telephone.Ext ? ` #${telephone.Ext}` : ''}`
      : '',
    ...(picture ? { Picture: picture } : {}),
    ...(position ? { Position: position } : {}),
    SrcUpdateTime: item.UpdateTime || '',
    UpdateTime: item.UpdateTime || '',
    WebsiteUrl: item.WebsiteUrl || '',
  };
};

const mapScenicSpot = (
  item: TourismV2Item,
  common: TourismCommonProperty,
): ScenicSpot => ({
  ...common,
  Class1: item.AttractionClasses?.[0]?.toString() || '',
  Class2: item.AttractionClasses?.[1]?.toString() || '',
  Class3: item.AttractionClasses?.[2]?.toString() || '',
  DescriptionDetail: item.Description || '',
  Keyword: item.Tags?.join(', ') || '',
  Level: item.AssetsClass?.toString() || '',
  OpenTime: item.ServiceTimeInfo || '',
  ParkingPosition: common.Position || {},
  Remarks: item.Remarks || '',
  ScenicSpotID: item.AttractionID || '',
  ScenicSpotName: item.AttractionName || '',
  TicketInfo: item.FeeInfo || '',
  TravelInfo: item.TrafficInfo || '',
  ZipCode: item.PostalAddress?.ZipCode || '',
});

const mapRestaurant = (
  item: TourismV2Item,
  common: TourismCommonProperty,
): Restaurant => ({
  ...common,
  Class: mapClasses(item.CuisineClasses),
  OpenTime: item.ServiceTimeInfo || '',
  RestaurantID: item.RestaurantID || '',
  RestaurantName: item.RestaurantName || '',
  ZipCode: item.PostalAddress?.ZipCode || '',
});

const mapHotel = (
  item: TourismV2Item,
  common: TourismCommonProperty,
): Hotel => ({
  ...common,
  Class: mapClasses(item.HotelClasses),
  Fax:
    item.Organizations?.flatMap(
      (organization) => organization.Faxes || [],
    )[0] || '',
  Grade: item.HotelStars?.toString() || '',
  HotelID: item.HotelID || '',
  HotelName: item.HotelName || '',
  ServiceInfo: item.ServiceInfo || '',
  Spec: item.RoomInfo || '',
  ZipCode: item.PostalAddress?.ZipCode || '',
});

const mapActivity = (
  item: TourismV2Item,
  common: TourismCommonProperty,
): Activity => ({
  ...common,
  ActivityID: item.EventID || '',
  ActivityName: item.EventName || '',
  Charge: item.FeeInfo || '',
  Class1: item.EventClasses?.[0]?.toString() || '',
  Class2: item.EventClasses?.[1]?.toString() || '',
  Cycle: '',
  EndTime: item.EndDateTime || '',
  Location: common.Address || '',
  NonCycle: '',
  Organizer:
    item.Organizations?.map((organization) => organization.Name)
      .filter(Boolean)
      .join(', ') || '',
  ParkingInfo: item.ParkingInfo || '',
  Particpation: item.Participant || '',
  Remarks: item.Remarks || '',
  SrcUpdateTime: item.UpdateTime || '',
  StartTime: item.StartDateTime || '',
  TravelInfo: item.TrafficInfo || '',
  UpdateTime: item.UpdateTime || '',
});

const mapTourismItem = (
  type: TourismPropertyType,
  item: TourismV2Item,
): Activity | Hotel | Restaurant | ScenicSpot => {
  const common = mapCommonProperty(item);

  switch (type) {
    case 'ScenicSpot':
      return mapScenicSpot(item, common);
    case 'Restaurant':
      return mapRestaurant(item, common);
    case 'Hotel':
      return mapHotel(item, common);
    case 'Activity':
      return mapActivity(item, common);
    default:
      throw new Error(`Unknown tourism type: ${type}`);
  }
};

const TRAILING_AND = / and $/u;

// TDX's Tourism V2 answers 500 to any filter on the Images collection
// (`any()`, `any(i: i/URL ne null)`, `$count`), so the legacy "has a picture"
// clause is dropped; cards without one fall back to /static/fallback.jpg.
const translateFilter = (filter?: string) =>
  filter
    ?.replace(/\bPicture\/PictureUrl1 ne null(?: and )?/gu, '')
    .replace(TRAILING_AND, '')
    .replace(/\bAddress ne null\b/gu, 'PostalAddress/StreetAddress ne null')
    .replace(/\bCity ne null\b/gu, 'PostalAddress/City ne null');

const translateOrderBy = (orderBy?: string) =>
  orderBy
    ?.replaceAll('SrcUpdateTime', 'UpdateTime')
    .replaceAll('StartTime', 'StartDateTime')
    .replaceAll('TicketInfo', 'FeeInfo');

export class TourismService {
  private readonly service: TdxService;

  private readonly client: ReturnType<typeof createClient>;

  constructor(service: TdxService) {
    this.service = service;
    this.client = service.createClient('tourism', (o) =>
      createClient(createConfig(o)),
    );
  }

  getScenicSpotById = this.generateGetById<ScenicSpot>('ScenicSpot');

  getScenicSpots = this.generateGetItems<ScenicSpot>('ScenicSpot');

  getScenicSpotsByCity = this.generateGetItemsByCity<ScenicSpot>('ScenicSpot');

  getRestaurantById = this.generateGetById<Restaurant>('Restaurant');

  getRestaurants = this.generateGetItems<Restaurant>('Restaurant');

  getRestaurantsByCity = this.generateGetItemsByCity<Restaurant>('Restaurant');

  getHotelById = this.generateGetById<Hotel>('Hotel');

  getHotels = this.generateGetItems<Hotel>('Hotel');

  getHotelsByCity = this.generateGetItemsByCity<Hotel>('Hotel');

  getActivityById = this.generateGetById<Activity>('Activity');

  getActivities = this.generateGetItems<Activity>('Activity');

  getActivitiesByCity = this.generateGetItemsByCity<Activity>('Activity');

  private generateGetById<T>(type: TourismPropertyType) {
    return async (id: string) => {
      const v2Type = V2_TYPE_MAP[type];
      const items = await this.getItems<T>(type, {
        filter: `${v2Type}ID eq '${id.replaceAll("'", "''")}'`,
        top: 1,
      });

      return TdxService.checkExistence(items);
    };
  }

  private generateGetItems<T>(type: TourismPropertyType) {
    return async (params = this.service.DEFAULT_API_PARAMS) =>
      this.getItems<T>(type, params);
  }

  private generateGetItemsByCity<T>(type: TourismPropertyType) {
    return async (city: City, params = this.service.DEFAULT_API_PARAMS) =>
      this.getItems<T>(type, params, city);
  }

  private async getItems<T>(
    type: TourismPropertyType,
    params: ApiParam,
    city?: City,
  ): Promise<T[]> {
    const filter = [
      translateFilter(params.filter),
      city ? `PostalAddress/City eq '${CityMap[city]}'` : '',
    ]
      .filter(Boolean)
      .join(' and ');
    const { data } = await V2_OPERATIONS[type]({
      client: this.client,
      query: {
        ...toODataQuery({
          filter,
          orderBy: translateOrderBy(params.orderBy),
          top: params.top,
        }),
        // The tourism spec types $skip as a number.
        $skip: params.skip ? Number(params.skip) : undefined,
      },
      throwOnError: true,
    });
    const items = (data as { value?: TourismV2Item[] }).value ?? [];

    return items.map((item) => mapTourismItem(type, item) as T);
  }
}
