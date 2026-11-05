import { type City, CitySet } from '@f2e/tdx-core';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';

import Layout from '@/components/layout/layout';
import { tourismService } from '@/services/tdx';
import RestaurantView from './view';

export const revalidate = 86_400;

export const generateStaticParams = () => [];

interface RestaurantPageParams {
  city: string;
  id: string;
}

const getRestaurant = cache(async (city: string, id: string) => {
  if (!CitySet.has(city as City)) {
    return;
  }

  return await tourismService.getRestaurantById(id);
});

export const generateMetadata = async ({
  params,
}: {
  params: Promise<RestaurantPageParams>;
}): Promise<Metadata> => {
  const { city, id } = await params;
  const restaurant = await getRestaurant(city, id);

  if (!restaurant) {
    notFound();
  }

  return {
    description: restaurant.Description,
    openGraph: {
      description: restaurant.Picture?.PictureDescription1,
      images: restaurant.Picture?.PictureUrl1
        ? [restaurant.Picture.PictureUrl1]
        : undefined,
      title: restaurant.RestaurantName,
    },
    title: `台灣旅遊導覽網 | ${restaurant.RestaurantName}`,
  };
};

const RestaurantPage = async ({
  params,
}: {
  params: Promise<RestaurantPageParams>;
}) => {
  const { city, id } = await params;
  const restaurant = await getRestaurant(city, id);

  if (!restaurant) {
    notFound();
  }

  return (
    <Layout colorPalette="restaurants">
      <RestaurantView restaurant={restaurant} />
    </Layout>
  );
};

export default RestaurantPage;
