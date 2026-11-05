import type { Metadata } from 'next';

import PlaceListPage from '@/components/search/place-list-page';
import background from '@/static/background/scenes.png';
import wordOne from '@/static/background/scenes-1.png';
import wordTwo from '@/static/background/scenes-2.png';

// Generated on first request, then served from the CDN for six hours.
export const revalidate = 21_600;
export const generateStaticParams = () => [];

export const metadata: Metadata = {
  description: '依縣市與分類瀏覽全台景點。',
  openGraph: {
    description: '依縣市與分類瀏覽全台景點。',
    images: ['/static/background/scenes.png'],
  },
  title: '台灣旅遊導覽網 | 景點',
};

const ScenesPage = ({
  params,
}: {
  params: Promise<{ filters?: string[] }>;
}) => (
  <PlaceListPage
    image={background}
    params={params}
    subtitle="依縣市與分類瀏覽全台景點。"
    type="scene"
    wordImages={[wordOne, wordTwo]}
  />
);

export default ScenesPage;
