'use client';

import {
  Box,
  Container,
  Flex,
  NativeSelect,
  SimpleGrid,
  Spinner,
  Tabs,
} from '@chakra-ui/react';
import { Cities, type City, CityMap } from '@f2e/tdx';
import { LazyMotion, m, type Variants } from 'framer-motion';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { type ChangeEvent, useState } from 'react';

import CycleCard from '@/components/cycle-card';
import background from '@/map.jpg';
import { useGetCyclingByCityQuery } from '@/services/local';

// Server-rendered stand-in so the background paints before mapbox-gl loads.
const MapPlaceholder = () => (
  <Box h="calc(100vh - 128px)" maxW="fill-available">
    <Box h="full" overflow="hidden" pos="fixed" top="0" w="full">
      <Image
        alt="背景"
        fill
        priority
        sizes="100vw"
        src={background}
        style={{ objectFit: 'cover', objectPosition: 'center' }}
      />
    </Box>
  </Box>
);

const MapView = dynamic(() => import('@/components/map'), {
  loading: MapPlaceholder,
  ssr: false,
});

const MotionGrid = m.create(SimpleGrid);

// Defer the animation engine until the cycling grid first renders.
const loadMotionFeatures = () =>
  import('framer-motion').then((mod) => mod.domAnimation);

const variants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.125,
      stiffness: 120,
      type: 'spring',
    },
  },
};

const HomeView = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [selectedCity, setSelectedCity] = useState<City>();
  const { data, isFetching } = useGetCyclingByCityQuery(selectedCity, {
    skip: tabIndex !== 1 || !selectedCity,
  });

  const onSelect = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedCity(event.target.value as City);
  };

  const handleTabsChange = (value: string) => {
    setTabIndex(Number(value));
  };

  const onToggle = () => {
    setTabIndex(0);
  };

  return (
    <Box color="white" h="full">
      <Tabs.Root
        id="tab"
        // biome-ignore lint/performance/noJsxPropsBind: callback needs local render state or the current event target.
        onValueChange={({ value }) => handleTabsChange(value)}
        value={String(tabIndex)}
        variant="plain"
      >
        <Tabs.List
          css={{
            '& button': {
              _first: {
                mr: -2.5,
              },
              _hover: {
                bg: 'whiteAlpha.200',
              },
              _selected: {
                _before: {
                  bg: 'whiteAlpha.100',
                  content: '""',
                  h: 'full',
                  pos: 'absolute',
                  rounded: 'full',
                  w: '50%',
                },
                _focus: {
                  bg: 'primary.dark',
                },
                _hover: {
                  bg: 'primary.dark',
                },
                bg: 'primary.main',
              },
              fontWeight: 'bold',
              px: 5,
              py: 3,
              rounded: 'full',
              transition: 'all 0.6s cubic-bezier(0.165, 0.84, 0.44, 1)',
            },
            bg: 'whiteAlpha.200',
            display: 'inline-flex',
            mt: 8,
            mx: 8,
            pos: 'relative',
            rounded: 'full',
            transition: 'all 0.6s cubic-bezier(0.165, 0.84, 0.44, 1)',
            zIndex: 'docked',
          }}
        >
          <Tabs.Trigger value="0">租車/還車</Tabs.Trigger>
          <Tabs.Trigger value="1">騎乘路線</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="0">
          <MapView />
        </Tabs.Content>
        <Tabs.Content value="1">
          <Container maxW="container.lg">
            <Flex align="center" justify="space-between">
              <NativeSelect.Root w="120px">
                <NativeSelect.Field
                  bg="whiteAlpha.200"
                  border="none"
                  fontWeight="bold"
                  onChange={onSelect}
                  rounded="full"
                  value={selectedCity ?? ''}
                >
                  <option disabled value="">
                    選擇地區
                  </option>
                  {Cities.map((city) => (
                    <option key={city} value={city}>
                      {CityMap[city]}
                    </option>
                  ))}
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
              <Spinner
                animationDuration="0.65s"
                borderColor="gray.200"
                borderTopColor="secondary.main"
                borderWidth="3px"
                display={isFetching ? 'block' : 'none'}
                size="lg"
              />
            </Flex>
            {data?.success && !isFetching && (
              <LazyMotion features={loadMotionFeatures} strict>
                <MotionGrid
                  animate="show"
                  columns={[1, 2, 4]}
                  gap={[4, 8]}
                  initial="hidden"
                  my={[4, 8]}
                  variants={variants}
                >
                  {data.data.map((path) => (
                    <CycleCard
                      city={CityMap[path.City] as City}
                      geoJson={path.geoJson}
                      key={`${path.CityCode}-${path.Town}-${path.RouteName}-${path.RoadSectionStart}-${path.RoadSectionEnd}`}
                      length={path.CyclingLength}
                      name={path.RouteName}
                      onToggle={onToggle}
                    />
                  ))}
                </MotionGrid>
              </LazyMotion>
            )}
          </Container>
        </Tabs.Content>
      </Tabs.Root>
    </Box>
  );
};

export default HomeView;
