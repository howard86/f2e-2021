import { type City, CitySet } from '@f2e/tdx-core';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';

import Layout from '@/components/layout/layout';
import { tourismService } from '@/services/tdx';
import SceneView from './view';

export const revalidate = 86_400;

export const generateStaticParams = () => [];

interface ScenePageParams {
  city: string;
  id: string;
}

const getScene = cache(async (city: string, id: string) => {
  if (!CitySet.has(city as City)) {
    return;
  }

  return await tourismService.getScenicSpotById(id);
});

export const generateMetadata = async ({
  params,
}: {
  params: Promise<ScenePageParams>;
}): Promise<Metadata> => {
  const { city, id } = await params;
  const scene = await getScene(city, id);

  if (!scene) {
    notFound();
  }

  return {
    description: scene.Description,
    openGraph: {
      description: scene.Picture?.PictureDescription1,
      images: scene.Picture?.PictureUrl1
        ? [scene.Picture.PictureUrl1]
        : undefined,
      title: scene.ScenicSpotName,
      type: 'article',
    },
    title: `台灣旅遊導覽網 | ${scene.ScenicSpotName}`,
  };
};

const ScenePage = async ({ params }: { params: Promise<ScenePageParams> }) => {
  const { city, id } = await params;
  const scene = await getScene(city, id);

  if (!scene) {
    notFound();
  }

  return (
    <Layout colorPalette="scenes">
      <SceneView scene={scene} />
    </Layout>
  );
};

export default ScenePage;
