import { CityMap, TdxService } from '@f2e/tdx-core';
import {
  type Activity,
  type Hotel,
  type Restaurant,
  type ScenicSpot,
  TourismService,
} from '@f2e/tdx-tourism';

import type { PlaceCardProps } from '@/components/place-card';
import type { SceneCardProps } from '@/components/scene-card';

const service = new TdxService({
  baseUrl: process.env.TDX_BASE_URL,
  clientId: process.env.TDX_CLIENT_ID,
  clientSecret: process.env.TDX_CLIENT_SECRET,
});

export const tourismService = new TourismService(service);

const serializeUndefined = <T extends object>(item: T) => {
  const newObject = {} as T;

  for (const key of Object.keys(item)) {
    if (item[key] !== undefined) {
      newObject[key] = item[key];
    }
  }

  return newObject;
};

export const mapScenicSpotToSceneCard = (item: ScenicSpot): SceneCardProps =>
  serializeUndefined({
    city: item.City,
    href: `/${CityMap[item.City]}/scene/${item.ScenicSpotID}`,
    image: item.Picture?.PictureUrl1 || '/static/fallback.jpg',
    name: item.ScenicSpotName,
  });

export const mapRestaurantToPlaceCard = (item: Restaurant): PlaceCardProps =>
  serializeUndefined({
    address: item.Address,
    city: item.City,
    contactNumber: item.Phone,
    href: `/${CityMap[item.City]}/restaurant/${item.RestaurantID}`,
    image: item.Picture?.PictureUrl1 || '/static/fallback.jpg',
    name: item.RestaurantName,
    openingHours: item.OpenTime,
  });

export const mapHotelToPlaceCard = (item: Hotel): PlaceCardProps =>
  serializeUndefined({
    address: item.Address,
    city: item.City,
    contactNumber: item.Phone,
    href: `/${CityMap[item.City]}/hotel/${item.HotelID}`,
    image: item.Picture?.PictureUrl1 || '/static/fallback.jpg',
    name: item.HotelName,
    openingHours: item.ServiceInfo,
  });

export const mapActivityToPlaceCard = (item: Activity): PlaceCardProps =>
  serializeUndefined({
    address: item.Address,
    city: item.City,
    contactNumber: item.Phone,
    href: `/${CityMap[item.City]}/activity/${item.ActivityID}`,
    image: item.Picture?.PictureUrl1 || '/static/fallback.jpg',
    name: item.ActivityName,
    openingHours:
      item.StartTime && item.EndTime
        ? `${new Date(item.StartTime).toLocaleDateString()}~${new Date(
            item.EndTime,
          ).toLocaleDateString()}`
        : undefined,
  });
