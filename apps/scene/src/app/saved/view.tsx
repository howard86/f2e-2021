'use client';

import {
  Box,
  Button,
  Container,
  HStack,
  SimpleGrid,
  Stack,
} from '@chakra-ui/react';
import { useCallback, useState } from 'react';

import EmptyState from '@/components/search/empty-state';
import PlaceCard from '@/components/ui/place-card';
import PlaceGridSkeleton from '@/components/ui/place-grid-skeleton';
import SectionHeading from '@/components/ui/section-heading';
import useSaved from '@/hooks/use-saved';
import {
  PLACE_CATEGORY,
  PLACE_LABEL,
  PLACE_TYPES,
  type PlaceSummary,
  type PlaceType,
} from '@/types/place';

type Filter = 'all' | PlaceType;

interface FilterButtonProps {
  count: number;
  label: string;
  onSelect: (filter: Filter) => void;
  palette?: string;
  selected: boolean;
  value: Filter;
}

const FilterButton = ({
  count,
  label,
  onSelect,
  palette,
  selected,
  value,
}: FilterButtonProps) => {
  const handleClick = useCallback(() => onSelect(value), [onSelect, value]);

  return (
    <Button
      aria-pressed={selected}
      colorPalette={palette}
      onClick={handleClick}
      size="sm"
      variant={selected ? 'solid' : 'outline'}
    >
      {label}（{count}）
    </Button>
  );
};

interface SavedItemProps {
  onRemove: (place: PlaceSummary) => void;
  place: PlaceSummary;
}

const SavedItem = ({ onRemove, place }: SavedItemProps) => {
  const handleClick = useCallback(() => onRemove(place), [onRemove, place]);

  return (
    <Stack gap="2">
      <PlaceCard place={place} />
      <Button
        alignSelf="flex-start"
        aria-label={`移除收藏：${place.name}`}
        colorPalette="gray"
        onClick={handleClick}
        size="xs"
        variant="ghost"
      >
        清除
      </Button>
    </Stack>
  );
};

const SavedView = () => {
  const { items, ready, toggle } = useSaved();
  const [filter, setFilter] = useState<Filter>('all');

  if (!ready) {
    return (
      <Container maxW="6xl" py={{ base: 6, md: 10 }}>
        <PlaceGridSkeleton count={4} />
      </Container>
    );
  }

  if (items.length === 0) {
    return (
      <Container maxW="6xl" py={{ base: 6, md: 10 }}>
        <EmptyState
          action={{ href: '/scenes', label: '去逛逛景點' }}
          description="在景點、美食、住宿或活動頁按下收藏，就會出現在這裡。"
          title="還沒有收藏"
        />
      </Container>
    );
  }

  const types = PLACE_TYPES.filter((type) =>
    items.some((item) => item.type === type),
  );
  const visible = types.filter((type) => filter === 'all' || filter === type);

  return (
    <Container maxW="6xl" py={{ base: 6, md: 10 }}>
      <Stack gap="10">
        <HStack aria-label="依類型篩選" gap="2" role="group" wrap="wrap">
          <FilterButton
            count={items.length}
            label="全部"
            onSelect={setFilter}
            selected={filter === 'all'}
            value="all"
          />
          {types.map((type) => (
            <FilterButton
              count={items.filter((item) => item.type === type).length}
              key={type}
              label={PLACE_LABEL[type]}
              onSelect={setFilter}
              palette={PLACE_CATEGORY[type]}
              selected={filter === type}
              value={type}
            />
          ))}
        </HStack>
        {visible.map((type) => (
          <Box colorPalette={PLACE_CATEGORY[type]} key={type}>
            <SectionHeading title={PLACE_LABEL[type]} />
            <SimpleGrid columns={{ base: 1, lg: 3, md: 2 }} gap="6" mt="4">
              {items
                .filter((item) => item.type === type)
                .map((place) => (
                  <SavedItem key={place.href} onRemove={toggle} place={place} />
                ))}
            </SimpleGrid>
          </Box>
        ))}
      </Stack>
    </Container>
  );
};

export default SavedView;
