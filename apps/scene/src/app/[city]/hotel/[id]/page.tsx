import { type City, CitySet } from '@f2e/tdx';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';

import Layout from '@/components/layout/layout';
import { HOTELS_PAGE_PROPS } from '@/constants/page-props';
import { tourismService } from '@/services/tdx';
import HotelView from './view';

export const revalidate = 86_400;

export const generateStaticParams = () => [];

interface HotelPageParams {
  city: string;
  id: string;
}

const getHotel = cache(async (city: string, id: string) => {
  if (!CitySet.has(city as City)) {
    return;
  }

  return await tourismService.getHotelById(id);
});

export const generateMetadata = async ({
  params,
}: {
  params: Promise<HotelPageParams>;
}): Promise<Metadata> => {
  const { city, id } = await params;
  const hotel = await getHotel(city, id);

  if (!hotel) {
    notFound();
  }

  return {
    description: hotel.Description,
    openGraph: {
      description: hotel.Picture?.PictureDescription1,
      images: hotel.Picture?.PictureUrl1
        ? [hotel.Picture.PictureUrl1]
        : undefined,
      title: hotel.HotelName,
      type: 'article',
    },
    title: `台灣旅遊導覽網 | ${hotel.HotelName}`,
  };
};

const HotelPage = async ({ params }: { params: Promise<HotelPageParams> }) => {
  const { city, id } = await params;
  const hotel = await getHotel(city, id);

  if (!hotel) {
    notFound();
  }

  return (
    <Layout {...HOTELS_PAGE_PROPS}>
      <HotelView hotel={hotel} />
    </Layout>
  );
};

export default HotelPage;
