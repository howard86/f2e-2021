import type { Metadata } from 'next';

import PlaceListPage from '@/components/search/place-list-page';
import type { RawSearchParams } from '@/components/search/search-params';
import background from '@/static/background/hotels.png';
import wordOne from '@/static/background/hotels-1.png';
import wordTwo from '@/static/background/hotels-2.png';

export const metadata: Metadata = {
  description: '依縣市與類型比較住宿選擇。',
  openGraph: {
    description: '依縣市與類型比較住宿選擇。',
    images: ['/static/background/hotels.png'],
  },
  title: '台灣旅遊導覽網 | 住宿',
};

const HotelsPage = ({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) => (
  <PlaceListPage
    basePath="/hotels"
    image={background}
    searchParams={searchParams}
    subtitle="依縣市與類型比較住宿選擇。"
    type="hotel"
    wordImages={[wordOne, wordTwo]}
  />
);

export default HotelsPage;
