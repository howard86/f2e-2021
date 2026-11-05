import { type City, CitySet } from '@f2e/tdx-core';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { cache } from 'react';

import Layout from '@/components/layout/layout';
import { DEFAULT_OG_IMAGE, OPEN_GRAPH_BASE, TWITTER_BASE } from '@/lib/seo';
import { getPlaceDetail } from '@/services/places';
import { PLACE_CATEGORY, type PlaceType } from '@/types/place';

import DetailView from './detail-view';
import { truncate } from './helpers';

export interface DetailParams {
  city: string;
  id: string;
}

const getDetail = cache(async (type: PlaceType, city: string, id: string) => {
  if (!CitySet.has(city as City)) {
    return;
  }
  const detail = await getPlaceDetail(type, id);

  // Right record under the wrong city: send visitors to the canonical URL.
  if (detail && detail.citySlug !== city) {
    redirect(detail.href);
  }

  return detail;
});

export const generateDetailMetadata = async (
  type: PlaceType,
  params: Promise<DetailParams>,
): Promise<Metadata> => {
  const { city, id } = await params;
  const detail = await getDetail(type, city, id);

  if (!detail) {
    notFound();
  }
  const description = truncate(detail.description);
  const image = detail.images[0]?.url;

  return {
    alternates: { canonical: detail.href },
    description,
    openGraph: {
      ...OPEN_GRAPH_BASE,
      description,
      images: image ? [{ alt: detail.name, url: image }] : [DEFAULT_OG_IMAGE],
      title: detail.name,
      type: 'article',
    },
    title: detail.name,
    twitter: TWITTER_BASE,
  };
};

/** Shared by the four detail routes; metadata and page use one cached fetch. */
const DetailPage = async ({
  params,
  type,
}: {
  params: Promise<DetailParams>;
  type: PlaceType;
}) => {
  const { city, id } = await params;
  const detail = await getDetail(type, city, id);

  if (!detail) {
    notFound();
  }

  return (
    <Layout colorPalette={PLACE_CATEGORY[type]}>
      <DetailView detail={detail} />
    </Layout>
  );
};

export default DetailPage;
