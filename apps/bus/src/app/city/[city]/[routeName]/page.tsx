import type { BusDirection } from '@f2e/tdx-bus';
import { type City, CityMap, CitySet } from '@f2e/tdx-core';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { type GeoJSONLineString, parse } from 'wellknown';

import { OPEN_GRAPH_BASE } from '@/constants/seo';
import { busService } from '@/services/tdx';
import { loadFixture, serveFixtures } from '@/utils/fixtures';
import BusRouteView, { type RouteStopEntity } from './view';

export const revalidate = 86_400; // ONE_DAY; Next requires a literal

interface PageProps {
  params: Promise<{ city: string; routeName: string }>;
}

export const generateStaticParams = () => [];

const decode = (value: string) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

export const generateMetadata = async ({
  params,
}: PageProps): Promise<Metadata> => {
  const { city, routeName } = await params;

  const name = decode(routeName);
  const cityName = CityMap[decode(city) as City] ?? decode(city);

  const description = `「${name}」${cityName}公車即時動態、站牌與路線圖。`;
  const title = `${name}-${cityName}`;

  return {
    alternates: {
      canonical: `/city/${encodeURIComponent(decode(city))}/${encodeURIComponent(name)}`,
    },
    description,
    openGraph: { ...OPEN_GRAPH_BASE, description, title },
    title,
  };
};

const BusRoutePage = async ({ params }: PageProps) => {
  const { city: rawCity, routeName: rawRouteName } = await params;
  const routeName = decode(rawRouteName);
  const city = decode(rawCity) as City;

  if (!CitySet.has(city)) {
    notFound();
  }

  const fixtures = serveFixtures();

  const [busRoute] = fixtures
    ? await loadFixture.route()
    : await busService.getBusRoutesByCityAndRouteName(city, routeName);

  if (!busRoute) {
    redirect('/city');
  }

  const [busShapes, busStops] = await Promise.all([
    fixtures
      ? loadFixture.shape()
      : busService.getBusShapesByCityAndRouteName(city, routeName),
    fixtures
      ? loadFixture.stops()
      : busService.getBusStopOfRoutesByCityAndRouteName(city, routeName, {
          filter: `RouteName/Zh_tw eq '${routeName}'`,
        }),
  ]);

  const [busShape] = busShapes;

  if (!busShape || busStops.length === 0) {
    redirect('/city');
  }

  const directions: BusDirection[] = [];
  const routeStopEntity = {} as RouteStopEntity;

  for (const routeStop of busStops) {
    // TODO: might have routes that have multiple directions
    if (!directions.includes(routeStop.Direction)) {
      directions.push(routeStop.Direction);
      routeStopEntity[routeStop.Direction] = routeStop;
    }
  }

  return (
    <BusRouteView
      busRoute={busRoute}
      busStopEntity={routeStopEntity}
      city={city}
      directions={directions}
      geoJson={parse(busShape.Geometry) as GeoJSONLineString}
      routeName={routeName}
    />
  );
};

export default BusRoutePage;
