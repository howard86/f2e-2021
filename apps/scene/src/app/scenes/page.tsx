import type { Metadata } from 'next';

import PlaceListPage from '@/components/search/place-list-page';
import type { RawSearchParams } from '@/components/search/search-params';
import background from '@/static/background/scenes.png';
import wordOne from '@/static/background/scenes-1.png';
import wordTwo from '@/static/background/scenes-2.png';

export const metadata: Metadata = {
  description: '依縣市與分類瀏覽全台景點。',
  openGraph: {
    description: '依縣市與分類瀏覽全台景點。',
    images: ['/static/background/scenes.png'],
  },
  title: '台灣旅遊導覽網 | 景點',
};

const ScenesPage = ({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) => (
  <PlaceListPage
    basePath="/scenes"
    image={background}
    searchParams={searchParams}
    subtitle="依縣市與分類瀏覽全台景點。"
    type="scene"
    wordImages={[wordOne, wordTwo]}
  />
);

export default ScenesPage;
