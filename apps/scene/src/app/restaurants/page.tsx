import type { Metadata } from 'next';

import Layout from '@/components/layout/layout';
import { DEFAULT_FETCHED_CARD_NUMBER } from '@/constants/pagination';
import { mapRestaurantToPlaceCard, tourismService } from '@/services/tdx';
import RestaurantsView from './view';

export const revalidate = 21_600;

export const metadata: Metadata = {
  openGraph: {
    description: '美食',
    images: ['/static/background/restaurants.png'],
  },
};

const RestaurantsPage = async () => {
  const restaurants = await tourismService.getRestaurants({
    filter: 'Picture/PictureUrl1 ne null and Address ne null and City ne null',
    orderBy: 'SrcUpdateTime desc, Description desc',
    select: 'RestaurantID,RestaurantName,City,Address,OpenTime,Phone,Picture',
    top: DEFAULT_FETCHED_CARD_NUMBER,
  });

  return (
    <Layout colorPalette="restaurants">
      <RestaurantsView
        restaurants={restaurants.map(mapRestaurantToPlaceCard)}
      />
    </Layout>
  );
};

export default RestaurantsPage;
