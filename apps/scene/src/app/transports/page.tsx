import { Box, Flex, Grid, SimpleGrid } from '@chakra-ui/react';
import type { Metadata } from 'next';

import Background from '@/components/background';
import GridCard from '@/components/grid-card';
import Layout from '@/components/layout/layout';
import SectionBanner from '@/components/section-banner';
import ThemeCard from '@/components/theme-card';
import background from '@/static/background/transports.png';
import wordOne from '@/static/background/transports-1.png';
import wordTwo from '@/static/background/transports-2.png';

export const metadata: Metadata = {
  openGraph: {
    description: '交通',
    images: ['/static/background/transports.png'],
  },
};

const TransportsPage = () => (
  <Layout colorPalette="transports">
    <Background
      bgColor="colorPalette.muted"
      image={background}
      name="交通"
      wordOne={wordOne}
      wordOneAlt="交"
      wordTwo={wordTwo}
      wordTwoAlt="通"
    >
      <Grid
        gap={[4, 6]}
        h={['300px', '380px']}
        mt={[20, 24, 28]}
        templateColumns={['repeat(2, 1fr)', 'repeat(2, 1fr)', 'repeat(3, 1fr)']}
        templateRows="repeat(2, 1fr)"
      >
        <GridCard
          colSpan={1}
          href="https://www.railway.gov.tw/"
          image="/static/card/transports-1.png"
          isExternal
          rowSpan={[1, 1, 2]}
          title="火車"
        />
        <GridCard
          colSpan={1}
          href="https://www.thsrc.com.tw"
          image="/static/card/transports-2.png"
          isExternal
          rowSpan={1}
          title="高鐵"
        />
        <GridCard
          colSpan={1}
          href="https://www.metro.taipei"
          image="/static/card/transports-4.png"
          isExternal
          rowSpan={[1, 1, 2]}
          title="捷運"
        />
        <GridCard
          colSpan={1}
          href="https://ebus.gov.taipei"
          image="/static/card/transports-3.png"
          isExternal
          rowSpan={1}
          title="公車"
        />
      </Grid>
    </Background>
    <Box
      bgGradient="to-b"
      gradientFrom="colorPalette.muted"
      gradientTo="white"
      h={['90px', '280px', '360px']}
    />
    <Flex bg="white" flexDir="column">
      <SectionBanner title="高速公路" />
      <SimpleGrid columns={[1, 2, 3]} gap={6} mx="8">
        <ThemeCard
          href="https://168.thb.gov.tw/"
          id="省道"
          image="/static/card/transports-5.png"
          theme="省道即時交通資訊"
        />
        <ThemeCard
          href="https://1968.freeway.gov.tw/"
          id="路況"
          image="/static/card/transports-6.png"
          theme="即時路況資訊"
        />
        <ThemeCard
          href="https://www.taiwanbus.tw/"
          id="公路"
          image="/static/card/transports-7.png"
          theme="公路客運乘車資訊"
        />
      </SimpleGrid>
      <SectionBanner title="交通租賃" />

      <SimpleGrid columns={[1, 2, 3]} gap={6} mx="8">
        <ThemeCard
          href="https://gogoout.com/blog/irent-zipcar-gogoout/"
          id="汽車"
          image="/static/card/transports-8.png"
          theme="汽車"
        />
        <ThemeCard
          href="https://technews.tw/2019/12/21/three-shared-locomotive-services-comparability/"
          id="摩托車"
          image="/static/card/transports-9.png"
          theme="摩特車"
        />
        <ThemeCard
          href="https://www.dot.gov.taipei/News.aspx?n=76E4ACA9285DDACA&sms=022299092584F3D9"
          id="自行車"
          image="/static/card/transports-10.png"
          theme="自行車"
        />
      </SimpleGrid>
    </Flex>
  </Layout>
);

export default TransportsPage;
