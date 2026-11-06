import {
  Box,
  Container,
  SimpleGrid,
  Stack,
  Text,
  VisuallyHidden,
} from '@chakra-ui/react';
import { ExternalLink } from '@f2e/ui/links';
import type { Metadata } from 'next';
import { Suspense } from 'react';

import Layout from '@/components/layout/layout';
import CityPicker from '@/components/transports/city-picker';
import { SectionSkeleton } from '@/components/transports/section-state';
import ThsrSection from '@/components/transports/thsr-section';
import PageHero from '@/components/ui/page-hero';
import SectionHeading from '@/components/ui/section-heading';
import { backgroundImage, OPEN_GRAPH_BASE } from '@/lib/seo';
import background from '@/static/background/transports.png';
import wordOne from '@/static/background/transports-1.png';
import wordTwo from '@/static/background/transports-2.png';

// The THSR datasets are cached for a week, which would otherwise become this
// page's lifetime too: a THSR section degraded at build would stay for a week.
export const revalidate = 3600;

const DESCRIPTION =
  '各縣市公車、自行車、捷運與高鐵資訊，以及公路路況與租賃的官方入口。';

export const metadata: Metadata = {
  alternates: { canonical: '/transports' },
  description: DESCRIPTION,
  openGraph: {
    ...OPEN_GRAPH_BASE,
    description: DESCRIPTION,
    images: [backgroundImage('transports', '交通')],
    title: '交通',
  },
  title: '交通',
};

interface LinkItem {
  description: string;
  href: string;
  title: string;
}

interface LinkGroup {
  items: LinkItem[];
  title: string;
}

const GROUPS: LinkGroup[] = [
  {
    items: [
      {
        description: '公車動態、路線與到站時間（全臺各縣市）',
        href: 'https://bus.howardism.dev',
        title: '公車動態',
      },
      {
        description: 'YouBike 站點與車輛、空位即時資訊',
        href: 'https://ubike.howardism.dev',
        title: 'YouBike 站點',
      },
    ],
    title: '本站工具',
  },
  {
    items: [
      {
        description: '台鐵時刻表、訂票與車站資訊',
        href: 'https://www.railway.gov.tw/',
        title: '火車',
      },
      {
        description: '高鐵時刻表、票價與訂票',
        href: 'https://www.thsrc.com.tw',
        title: '高鐵',
      },
      {
        description: '公路客運路線與乘車資訊',
        href: 'https://www.taiwanbus.tw/',
        title: '公路客運',
      },
    ],
    title: '大眾運輸',
  },
  {
    items: [
      {
        description: '省道即時交通資訊與路況影像',
        href: 'https://168.thb.gov.tw/',
        title: '省道',
      },
      {
        description: '高速公路即時路況與事件通報',
        href: 'https://1968.freeway.gov.tw/',
        title: '高速公路路況',
      },
      {
        description: '交通部公路局的公路政策與服務資訊',
        href: 'https://www.thb.gov.tw',
        title: '公路局',
      },
    ],
    title: '公路資訊',
  },
  {
    items: [
      {
        description: '和雲行動服務 iRent 共享汽車官方網站',
        href: 'https://www.irentcar.com.tw',
        title: '汽車',
      },
      {
        description: 'WeMo Scooter 共享機車官方網站',
        href: 'https://www.wemoscooter.com',
        title: '機車',
      },
      {
        description: 'GoShare 共享機車官方網站',
        href: 'https://www.ridegoshare.com',
        title: '機車（GoShare）',
      },
      {
        description: 'YouBike 微笑單車租賃與騎乘資訊',
        href: 'https://www.youbike.com.tw',
        title: '自行車',
      },
    ],
    title: '交通租賃',
  },
];

const WWW_PREFIX = /^www\./u;

const hostOf = (href: string) => new URL(href).hostname.replace(WWW_PREFIX, '');

const TransportsPage = () => (
  <Layout colorPalette="transports">
    <PageHero
      image={background}
      size="lg"
      subtitle={DESCRIPTION}
      title="交通"
      wordImages={[wordOne, wordTwo]}
    />
    <Container maxW="6xl" py={{ base: 6, md: 10 }}>
      <Stack gap="12">
        <Box as="section">
          <SectionHeading title="選擇縣市" />
          <CityPicker />
        </Box>
        <Box id="thsr" scrollMarginTop="24">
          <Suspense fallback={<SectionSkeleton />}>
            <ThsrSection />
          </Suspense>
        </Box>
        {GROUPS.map((group) => (
          <Box as="section" key={group.title}>
            <SectionHeading title={group.title} />
            <SimpleGrid columns={{ base: 1, lg: 3, md: 2 }} gap="4" mt="4">
              {group.items.map((item) => (
                <ExternalLink
                  _hover={{ borderColor: 'colorPalette.solid', shadow: 'sm' }}
                  bg="bg"
                  borderColor="border"
                  borderWidth="1px"
                  display="block"
                  href={item.href}
                  key={item.href}
                  p="5"
                  rounded="lg"
                  textDecoration="none"
                >
                  <Text textStyle="title-sm">
                    {item.title} <span aria-hidden>↗</span>
                    <VisuallyHidden>（另開新視窗）</VisuallyHidden>
                  </Text>
                  <Text color="fg.muted" mt="1" textStyle="body-sm">
                    {item.description}
                  </Text>
                  <Text color="colorPalette.fg" mt="3" textStyle="body-sm">
                    {hostOf(item.href)}
                  </Text>
                </ExternalLink>
              ))}
            </SimpleGrid>
          </Box>
        ))}
      </Stack>
    </Container>
  </Layout>
);

export default TransportsPage;
