import { Box, EmptyState, SimpleGrid } from '@chakra-ui/react';
import { FiMapPin } from 'react-icons/fi';
import type { PlaceSummary } from '@/types/place';

import PlaceCard from './place-card';

export interface PlaceGridProps {
  /** Shown instead of the grid when places is empty. */
  emptyText?: string;
  places: PlaceSummary[];
}

const PlaceGrid = ({
  places,
  emptyText = '目前沒有符合的資料',
}: PlaceGridProps) =>
  places.length === 0 ? (
    <EmptyState.Root py="16">
      <EmptyState.Content>
        <EmptyState.Indicator>
          <FiMapPin />
        </EmptyState.Indicator>
        <EmptyState.Description color="fg.muted" textStyle="body">
          {emptyText}
        </EmptyState.Description>
      </EmptyState.Content>
    </EmptyState.Root>
  ) : (
    <SimpleGrid
      as="ul"
      columns={{ base: 1, lg: 3, sm: 2, xl: 4 }}
      gap={{ base: 4, md: 6 }}
      listStyleType="none"
    >
      {places.map((place) => (
        <Box as="li" key={place.href}>
          <PlaceCard place={place} />
        </Box>
      ))}
    </SimpleGrid>
  );

export default PlaceGrid;
