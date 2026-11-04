import { type City, CitySet } from '@f2e/tdx-core';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import Layout from '@/components/layout/layout';
import { SCENES_PAGE_PROPS } from '@/constants/page-props';
import { DEFAULT_FETCHED_CARD_NUMBER } from '@/constants/pagination';
import {
  mapActivityToPlaceCard,
  mapHotelToPlaceCard,
  mapRestaurantToPlaceCard,
  mapScenicSpotToSceneCard,
  tourismService,
} from '@/services/tdx';
import CityView from './view';

export const revalidate = 21_600;

export const generateStaticParams = () => [];

interface CityPageParams {
  city: string;
}

export const generateMetadata = async ({
  params,
}: {
  params: Promise<CityPageParams>;
}): Promise<Metadata> => {
  const { city } = await params;

  return { title: `台灣旅遊導覽網 | ${city}` };
};

const getCityPlaces = async (city: City) => {
  try {
    const [scenes, restaurants, hotels, activities] = await Promise.all([
      tourismService.getScenicSpotsByCity(city, {
        filter: 'Picture/PictureUrl1 ne null',
        orderBy: 'SrcUpdateTime desc, TicketInfo desc',
        select: 'ScenicSpotID,ScenicSpotName,City,Picture',
        top: DEFAULT_FETCHED_CARD_NUMBER,
      }),
      tourismService.getRestaurantsByCity(city, {
        filter: 'Picture/PictureUrl1 ne null and Address ne null',
        orderBy: 'SrcUpdateTime desc, Description desc',
        select:
          'RestaurantID,RestaurantName,City,Address,OpenTime,Phone,Picture',
        top: DEFAULT_FETCHED_CARD_NUMBER,
      }),
      tourismService.getHotelsByCity(city, {
        filter: 'Picture/PictureUrl1 ne null and Address ne null',
        orderBy: 'SrcUpdateTime desc, ServiceInfo desc',
        select: 'HotelID,HotelName,City,Address,ServiceInfo,Phone,Picture',
        top: DEFAULT_FETCHED_CARD_NUMBER,
      }),
      tourismService.getActivitiesByCity(city, {
        filter: 'Picture/PictureUrl1 ne null and Address ne null',
        orderBy: 'StartTime desc',
        select:
          'ActivityID,ActivityName,City,Address,StartTime,EndTime,Phone,Picture',
        top: DEFAULT_FETCHED_CARD_NUMBER,
      }),
    ]);

    return {
      activities: activities.map(mapActivityToPlaceCard),
      hotels: hotels.map(mapHotelToPlaceCard),
      restaurants: restaurants.map(mapRestaurantToPlaceCard),
      scenes: scenes.map(mapScenicSpotToSceneCard),
    };
  } catch (error) {
    console.error(error);
  }
};

const CityPage = async ({ params }: { params: Promise<CityPageParams> }) => {
  const { city } = await params;

  if (!CitySet.has(city as City)) {
    notFound();
  }

  const places = await getCityPlaces(city as City);

  return (
    <Layout {...SCENES_PAGE_PROPS}>
      <CityView city={city as City} {...places} />
    </Layout>
  );
};

export default CityPage;
