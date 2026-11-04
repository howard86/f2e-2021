import type { Metadata } from 'next';

import NearByView from './view';

export const metadata: Metadata = {
  title: 'Iro Bus | 附近站牌',
};

const NearByPage = () => <NearByView />;

export default NearByPage;
