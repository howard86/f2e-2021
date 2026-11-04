'use client';

import { Box, Flex, IconButton, type StackProps } from '@chakra-ui/react';
import { useMemo, useState } from 'react';
import { BiChevronLeft, BiChevronRight } from 'react-icons/bi';

import WeatherStat from './weather-stat';

const NUMBER_OF_SLIDES = 5;

interface WeatherCarouselProps extends StackProps {
  weathers: OpenData.CityWeather[];
}

const WeatherCarousel = ({ weathers, ...props }: WeatherCarouselProps) => {
  const [sliceIndex, setSliceIndex] = useState(0);

  const increment = () =>
    setSliceIndex((index) => (index === weathers.length - 1 ? 0 : index + 1));
  const decrement = () =>
    setSliceIndex((index) => (index > 0 ? index - 1 : weathers.length - 1));

  const slides = useMemo(
    () =>
      [...weathers, ...weathers].slice(
        sliceIndex,
        sliceIndex + NUMBER_OF_SLIDES,
      ),
    [sliceIndex, weathers],
  );

  return (
    <Flex
      align="center"
      css={{
        _hover: {
          '& button': {
            opacity: 1,
          },
        },
        '& button': {
          _first: {
            bgGradient: ['to-r', 'none'],
            gradientFrom: ['whiteAlpha.800', 'transparent'],
            gradientTo: ['whiteAlpha.100', 'transparent'],
            left: 0,
          },
          _hover: {
            bgColor: ['whiteAlpha.800', 'gray.200'],
          },
          _last: {
            bgGradient: ['to-l', 'none'],
            gradientFrom: ['whiteAlpha.800', 'transparent'],
            gradientTo: ['whiteAlpha.100', 'transparent'],
            right: 0,
          },
          bgColor: ['transparent', 'gray.100'],
          h: ['full', 10],
          opacity: [0, 1],
          pos: ['absolute', 'initial'],
          rounded: ['none', 'full'],
        },
      }}
      maxW="3xl"
      pos="relative"
    >
      <Box display={['none', 'inline']} flexGrow={1} />
      <IconButton aria-label="show previous weather" onClick={decrement}>
        <BiChevronLeft />
      </IconButton>
      <Flex
        color="blackAlpha.500"
        justify="center"
        overflowY="hidden"
        py="8"
        {...props}
      >
        {slides.map((weather) => (
          <WeatherStat
            city={weather.city}
            key={weather.id}
            maxT={weather.maxT}
            minT={weather.minT}
            mx="4"
            weather={weather.weather}
          />
        ))}
      </Flex>
      <IconButton aria-label="show next weather" onClick={increment}>
        <BiChevronRight />
      </IconButton>
      <Box display={['none', 'inline']} flexGrow={1} />
    </Flex>
  );
};

export default WeatherCarousel;
