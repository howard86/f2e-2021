import type { Metadata } from 'next';

import PlaceListPage from '@/components/search/place-list-page';
import type { RawSearchParams } from '@/components/search/search-params';
import background from '@/static/background/restaurants.png';
import wordOne from '@/static/background/restaurants-1.png';
import wordTwo from '@/static/background/restaurants-2.png';

export const metadata: Metadata = {
  description: '依縣市與分類找到在地美食。',
  openGraph: {
    description: '依縣市與分類找到在地美食。',
    images: ['/static/background/restaurants.png'],
  },
  title: '台灣旅遊導覽網 | 美食',
};

const RestaurantsPage = ({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) => (
  <PlaceListPage
    basePath="/restaurants"
    image={background}
    searchParams={searchParams}
    subtitle="依縣市與分類找到在地美食。"
    type="restaurant"
    wordImages={[wordOne, wordTwo]}
  />
);

export default RestaurantsPage;
