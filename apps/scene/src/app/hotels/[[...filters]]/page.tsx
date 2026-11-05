import type { Metadata } from 'next';

import PlaceListPage, {
  placeListMetadata,
} from '@/components/search/place-list-page';
import { listStaticParams } from '@/lib/prerender';
import background from '@/static/background/hotels.png';
import wordOne from '@/static/background/hotels-1.png';
import wordTwo from '@/static/background/hotels-2.png';

// Major cities are prerendered on Vercel builds, the rest on first request;
// then served from the CDN for six hours.
export const revalidate = 21_600;
export const generateStaticParams = listStaticParams;

export const generateMetadata = ({
  params,
}: {
  params: Promise<{ filters?: string[] }>;
}): Promise<Metadata> => placeListMetadata('hotel', params);

const HotelsPage = ({
  params,
}: {
  params: Promise<{ filters?: string[] }>;
}) => (
  <PlaceListPage
    image={background}
    params={params}
    subtitle="依縣市與類型比較住宿選擇。"
    type="hotel"
    wordImages={[wordOne, wordTwo]}
  />
);

export default HotelsPage;
