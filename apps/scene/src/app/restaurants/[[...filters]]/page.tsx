import type { Metadata } from 'next';

import PlaceListPage, {
  placeListMetadata,
} from '@/components/search/place-list-page';
import { listStaticParams } from '@/lib/prerender';
import background from '@/static/background/restaurants.png';
import wordOne from '@/static/background/restaurants-1.png';
import wordTwo from '@/static/background/restaurants-2.png';

// The unfiltered list is prerendered on production builds, every filter on
// first request; then served from the CDN for six hours.
export const revalidate = 21_600;
export const generateStaticParams = listStaticParams;

export const generateMetadata = ({
  params,
}: {
  params: Promise<{ filters?: string[] }>;
}): Promise<Metadata> => placeListMetadata('restaurant', params);

const RestaurantsPage = ({
  params,
}: {
  params: Promise<{ filters?: string[] }>;
}) => (
  <PlaceListPage
    image={background}
    params={params}
    subtitle="依縣市與分類找到在地美食。"
    type="restaurant"
    wordImages={[wordOne, wordTwo]}
  />
);

export default RestaurantsPage;
