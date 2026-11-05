import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import Layout from '@/components/layout/layout';
import { DEFAULT_FETCHED_REMARK_NUMBER } from '@/constants/pagination';
import { mapScenicSpotToSceneCard, tourismService } from '@/services/tdx';
import ScenesView from './view';

export const revalidate = 21_600;

export const metadata: Metadata = {
  openGraph: {
    description: '景點',
    images: ['/static/background/scenes.png'],
  },
};

const ScenesPage = async () => {
  let scenes: Awaited<ReturnType<typeof tourismService.getScenicSpots>>;

  try {
    scenes = await tourismService.getScenicSpots({
      filter: 'Picture/PictureUrl1 ne null and City ne null',
      orderBy: 'SrcUpdateTime desc, TicketInfo desc',
      select: 'ScenicSpotID,ScenicSpotName,City,Picture',
      top: DEFAULT_FETCHED_REMARK_NUMBER,
    });
  } catch (error) {
    console.error(error);
    notFound();
  }

  return (
    <Layout colorPalette="scenes">
      <ScenesView scenes={scenes.map(mapScenicSpotToSceneCard)} />
    </Layout>
  );
};

export default ScenesPage;
