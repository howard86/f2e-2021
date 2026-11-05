import { Container } from '@chakra-ui/react';

import Layout from '@/components/layout/layout';
import PlaceGridSkeleton from '@/components/ui/place-grid-skeleton';

const Loading = () => (
  <Layout colorPalette="scenes">
    <Container maxW="6xl" py={{ base: 6, md: 10 }}>
      <PlaceGridSkeleton />
    </Container>
  </Layout>
);

export default Loading;
