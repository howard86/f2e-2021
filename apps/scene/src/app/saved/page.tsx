import type { Metadata } from 'next';

import Layout from '@/components/layout/layout';
import PageHero from '@/components/ui/page-hero';
import { DEFAULT_OG_IMAGE, OPEN_GRAPH_BASE } from '@/lib/seo';
import background from '@/static/background/main.png';
import SavedView from './view';

const TITLE = '我的收藏';
const DESCRIPTION = '儲存在這個瀏覽器中的景點、美食、住宿與活動。';

export const metadata: Metadata = {
  description: DESCRIPTION,
  openGraph: {
    ...OPEN_GRAPH_BASE,
    description: DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
    title: TITLE,
  },
  robots: { follow: false, index: false },
  title: TITLE,
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
