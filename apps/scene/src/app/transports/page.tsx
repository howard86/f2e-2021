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

import Layout from '@/components/layout/layout';
import PageHero from '@/components/ui/page-hero';
import SectionHeading from '@/components/ui/section-heading';
import { backgroundImage, OPEN_GRAPH_BASE } from '@/lib/seo';
import background from '@/static/background/transports.png';
import wordOne from '@/static/background/transports-1.png';
import wordTwo from '@/static/background/transports-2.png';

const DESCRIPTION = '火車、高鐵、捷運、公車、公路路況與租賃的官方資訊入口。';

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
        description: '臺北捷運路線圖、票價與營運公告',
        href: 'https://www.metro.taipei',
        title: '捷運',
      },
      {
        description: '臺北市公車動態、路線與到站時間',
        href: 'https://ebus.gov.taipei',
        title: '公車',
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
        description: '公路客運路線與乘車資訊',
        href: 'https://www.taiwanbus.tw/',
        title: '公路客運',
      },
    ],
    title: '公路資訊',
  },
  {
    items: [
      {
        description: '共享汽車與租車服務比較',
        href: 'https://gogoout.com/blog/irent-zipcar-gogoout/',
        title: '汽車',
      },
      {
        description: '共享機車服務比較',
        href: 'https://technews.tw/2019/12/21/three-shared-locomotive-services-comparability/',
        title: '機車',
      },
      {
        description: '臺北市自行車租賃與騎乘資訊',
        href: 'https://www.dot.gov.taipei/News.aspx?n=76E4ACA9285DDACA&sms=022299092584F3D9',
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
