import { Box, SimpleGrid, Skeleton, SkeletonText } from '@chakra-ui/react';

export interface PlaceGridSkeletonProps {
  count?: number;
}

const DEFAULT_COUNT = 8;

const PlaceGridSkeleton = ({
  count = DEFAULT_COUNT,
}: PlaceGridSkeletonProps) => (
  <SimpleGrid
    aria-busy="true"
    aria-label="載入中"
    columns={{ base: 1, lg: 3, sm: 2, xl: 4 }}
    gap={{ base: 4, md: 6 }}
  >
    {Array.from({ length: count }, (_, index) => (
      <Box
        borderWidth="1px"
        // biome-ignore lint/suspicious/noArrayIndexKey: static placeholder list that never reorders.
        key={index}
        overflow="hidden"
        rounded="xl"
      >
        <Skeleton aspectRatio="4 / 3" rounded="none" w="full" />
        <Box p="4">
          <Skeleton h="5" rounded="full" w="14" />
          <SkeletonText mt="3" noOfLines={2} />
          <Skeleton h="4" mt="3" w="1/2" />
        </Box>
      </Box>
    ))}
  </SimpleGrid>
);

export default PlaceGridSkeleton;
