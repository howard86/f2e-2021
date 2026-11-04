import type { Metadata } from 'next';

import Layout from '@/components/layout/layout';
import { HOTELS_LIST_PAGE_PROPS } from '@/constants/page-props';
import { DEFAULT_FETCHED_CARD_NUMBER } from '@/constants/pagination';
import { mapHotelToPlaceCard, tourismService } from '@/services/tdx';
import HotelsView from './view';

export const revalidate = 21_600;

export const metadata: Metadata = {
  openGraph: {
    description: '住宿',
    images: ['/static/background/hotels.png'],
  },
};

const HotelsPage = async () => {
  const hotels = await tourismService.getHotels({
    filter: 'Picture/PictureUrl1 ne null and Address ne null',
    orderBy: 'SrcUpdateTime desc, ServiceInfo desc',
    select: 'HotelID,HotelName,City,Address,ServiceInfo,Phone,Picture',
    top: DEFAULT_FETCHED_CARD_NUMBER,
  });

  return (
    <Layout {...HOTELS_LIST_PAGE_PROPS}>
      <HotelsView hotels={hotels.map(mapHotelToPlaceCard)} />
    </Layout>
  );
};

export default HotelsPage;
