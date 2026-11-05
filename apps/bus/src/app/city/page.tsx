import { CityMap } from '@f2e/tdx-core';
import type { Metadata } from 'next';

import { OPEN_GRAPH_BASE } from '@/constants/seo';
import CityView from './view';

export const metadata: Metadata = {
  openGraph: { ...OPEN_GRAPH_BASE, title: CityMap.Taipei },
  title: CityMap.Taipei,
};

const CityPage = () => <CityView />;

export default CityPage;
