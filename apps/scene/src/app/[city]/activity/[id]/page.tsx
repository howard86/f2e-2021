import { type City, CitySet } from '@f2e/tdx-core';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';

import Layout from '@/components/layout/layout';
import { ACTIVITIES_PAGE_PROPS } from '@/constants/page-props';
import { tourismService } from '@/services/tdx';
import ActivityView from './view';

export const revalidate = 86_400;

export const generateStaticParams = () => [];

interface ActivityPageParams {
  city: string;
  id: string;
}

const getActivity = cache(async (city: string, id: string) => {
  if (!CitySet.has(city as City)) {
    return;
  }

  return await tourismService.getActivityById(id);
});

export const generateMetadata = async ({
  params,
}: {
  params: Promise<ActivityPageParams>;
}): Promise<Metadata> => {
  const { city, id } = await params;
  const activity = await getActivity(city, id);

  if (!activity) {
    notFound();
  }

  return {
    description: activity.Description,
    openGraph: {
      description: activity.Picture?.PictureDescription1,
      images: activity.Picture?.PictureUrl1
        ? [activity.Picture.PictureUrl1]
        : undefined,
      title: activity.ActivityName,
      type: 'article',
    },
    title: `台灣旅遊導覽網 | ${activity.ActivityName}`,
  };
};

const ActivityPage = async ({
  params,
}: {
  params: Promise<ActivityPageParams>;
}) => {
  const { city, id } = await params;
  const activity = await getActivity(city, id);

  if (!activity) {
    notFound();
  }

  return (
    <Layout {...ACTIVITIES_PAGE_PROPS}>
      <ActivityView activity={activity} />
    </Layout>
  );
};

export default ActivityPage;
