import { Container, Stack } from '@chakra-ui/react';

import Layout from '@/components/layout/layout';
import { SectionSkeleton } from '@/components/transports/section-state';

const Loading = () => (
  <Layout colorPalette="transports">
    <Container maxW="6xl" py={{ base: 6, md: 10 }}>
      <Stack gap="10">
        <SectionSkeleton />
        <SectionSkeleton />
      </Stack>
    </Container>
  </Layout>
);

export default Loading;
