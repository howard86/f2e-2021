import { Container, Grid, Skeleton, Stack } from '@chakra-ui/react';

import PlaceGridSkeleton from '@/components/ui/place-grid-skeleton';

const DetailSkeleton = () => (
  <Container aria-busy="true" maxW="6xl" pb="16" pt="24">
    <Skeleton h="4" w="64" />
    <Stack gap="4" mt="6">
      <Skeleton h="4" w="16" />
      <Skeleton h="12" w="3/4" />
      <Skeleton h="6" w="48" />
    </Stack>
    <Skeleton aspectRatio={16 / 9} borderRadius="xl" mt="8" w="full" />
    <Grid
      gap="12"
      mt="10"
      templateColumns={{ base: '1fr', lg: 'minmax(0, 1fr) 22rem' }}
    >
      <Stack gap="3">
        <Skeleton h="4" />
        <Skeleton h="4" />
        <Skeleton h="4" w="2/3" />
        <Skeleton h="8" mt="6" w="40" />
        <Skeleton h="4" />
        <Skeleton h="4" w="1/2" />
      </Stack>
      <Skeleton borderRadius="xl" h="80" />
    </Grid>
    <Stack mt="16">
      <PlaceGridSkeleton />
    </Stack>
  </Container>
);

export default DetailSkeleton;
