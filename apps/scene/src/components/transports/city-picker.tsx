import { SimpleGrid, Text } from '@chakra-ui/react';
import { CityMap, counties, majorCities } from '@f2e/tdx-core';
import { RouteLink } from '@f2e/ui/links';

const CityPicker = () => (
  <SimpleGrid columns={{ base: 2, lg: 6, md: 4 }} gap="3">
    {[...majorCities, ...counties].map((city) => (
      <RouteLink
        _hover={{ bg: 'bg.muted' }}
        bg="bg.subtle"
        borderColor="border"
        borderWidth="1px"
        href={`/transports/${city}`}
        key={city}
        prefetch={false}
        px="4"
        py="4"
        rounded="lg"
        textAlign="center"
        textDecoration="none"
      >
        <Text textStyle="title-sm">{CityMap[city]}</Text>
      </RouteLink>
    ))}
  </SimpleGrid>
);

export default CityPicker;
