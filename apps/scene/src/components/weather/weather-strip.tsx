import { Box, Flex, HStack, Text } from '@chakra-ui/react';

import WeatherIcon from './weather-icon';

interface WeatherStripProps {
  /** One tile per city, or (with `periods`) one tile per forecast period. */
  mode?: 'cities' | 'periods';
  weathers: OpenData.CityWeather[];
}

const Temperature = ({ max, min }: { max: string; min: string }) => (
  <Text fontWeight="semibold" textStyle="body-sm">
    {min}–{max}°C
  </Text>
);

interface TileProps {
  label: string;
  maxT: string;
  minT: string;
  pop?: string;
  weather: OpenData.Weather | string;
}

const Tile = ({ label, maxT, minT, pop, weather }: TileProps) => (
  <Flex
    align="center"
    bg="bg.subtle"
    borderColor="border"
    borderWidth="1px"
    flexShrink={0}
    gap="3"
    minW="40"
    px="4"
    py="3"
    rounded="lg"
    scrollSnapAlign="start"
  >
    <WeatherIcon boxSize="9" weather={weather} />
    <Box>
      <Text color="fg.muted" textStyle="body-sm">
        {label}
      </Text>
      <Temperature max={maxT} min={minT} />
      <HStack color="fg.muted" gap="1" textStyle="body-sm">
        <Text>{weather}</Text>
        {pop ? <Text>降雨 {pop}%</Text> : null}
      </HStack>
    </Box>
  </Flex>
);

const WeatherStrip = ({ mode = 'cities', weathers }: WeatherStripProps) => {
  if (weathers.length === 0) {
    return null;
  }

  const tiles: (TileProps & { key: string })[] =
    mode === 'periods'
      ? (weathers[0]?.periods ?? []).map((period) => ({
          key: period.start,
          label: period.label,
          maxT: period.maxT,
          minT: period.minT,
          pop: period.pop,
          weather: period.weather,
        }))
      : weathers.map((item) => ({
          key: item.id,
          label: item.city,
          maxT: item.maxT,
          minT: item.minT,
          pop: item.periods[0]?.pop,
          weather: item.weather,
        }));

  return (
    <Flex
      aria-label="天氣預報"
      as="section"
      gap="3"
      overflowX="auto"
      pb="2"
      role="region"
      scrollSnapType="x mandatory"
      tabIndex={0}
    >
      {tiles.map(({ key, ...tile }) => (
        <Tile key={key} {...tile} />
      ))}
    </Flex>
  );
};

export default WeatherStrip;
