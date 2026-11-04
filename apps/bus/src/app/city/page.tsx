import { CityMap } from '@f2e/tdx';
import type { Metadata } from 'next';

import CityView from './view';

export const metadata: Metadata = {
  title: `Iro Bus | ${CityMap.Taipei}`,
};

const CityPage = () => <CityView />;

export default CityPage;
