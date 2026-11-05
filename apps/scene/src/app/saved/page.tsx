import type { Metadata } from 'next';

import Layout from '@/components/layout/layout';
import PageHero from '@/components/ui/page-hero';
import background from '@/static/background/main.png';
import SavedView from './view';

export const metadata: Metadata = {
  description: '儲存在這個瀏覽器中的景點、美食、住宿與活動。',
  robots: { follow: false, index: false },
  title: '台灣旅遊導覽網 | 我的收藏',
};

const SavedPage = () => (
  <Layout colorPalette="scenes">
    <PageHero
      image={background}
      size="md"
      subtitle="收藏只存在這個瀏覽器，不需要登入"
      title="我的收藏"
    />
    <SavedView />
  </Layout>
);

export default SavedPage;
