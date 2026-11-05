import type { Metadata } from 'next';

import { OPEN_GRAPH_BASE } from '@/constants/seo';
import NearByView from './view';

const TITLE = '附近站牌';

export const metadata: Metadata = {
  openGraph: { ...OPEN_GRAPH_BASE, title: TITLE },
  title: TITLE,
};

const NearByPage = () => <NearByView />;

export default NearByPage;
