import React from 'react';

import {
  Box,
  Button,
  Center,
  Flex,
  Heading,
  keyframes,
  VStack,
} from '@chakra-ui/react';

import background from '@/background.png';
import bus from '@/bus.png';
import LogoIcon from '@/components/icons/Logo';
import Image from '@/components/Image';
import RouteLink from '@/components/RouteLink';
import station from '@/station.png';

const slidingAnimation = keyframes`
  from {
    object-position: 10% 50%;
  }
  to {
    object-position: 90% 50%;
  }
`;

const HomePage = () => (
  <Box h="full" bgGradient="var(--chakra-colors-gradient-bg)">
    <Box pos="fixed" w="full" h="full" overflow="hidden">
      <Image
        alt="background"
        src={background}
        placeholder="blur"
        layout="fill"
        objectFit="cover"
        animation={`${slidingAnimation} 60s linear infinite alternate`}
      />
    </Box>
    <Center
      pos="relative"
      color="white"
      flexDir="column"
      h="full"
      zIndex="docked"
      mx="8"
    >
      <LogoIcon minW="145px" width="50%" />
      <Heading as="h1" mt="4" mb="8" fontSize="xl">
        提供最即時的公車動態，讓您輕鬆掌握資訊，現在就開始規劃您的路線吧！
      </Heading>
      <VStack spacing={4}>
        <Button as={RouteLink} href="/bus">
          市區公車
        </Button>
        <Button as={RouteLink} href="/coach">
          公路客運
        </Button>
        <Button as={RouteLink} href="/">
          乘車規劃
        </Button>
      </VStack>
    </Center>
    <Flex
      pos="fixed"
      bottom="8"
      w="full"
      align="flex-end"
      justify="space-between"
    >
      <Box pos="relative" maxW="40%" ml="4" mb="2">
        <Image alt="bus" src={bus} placeholder="blur" />
      </Box>
      <Box pos="relative" maxW="40%">
        <Image alt="station" src={station} placeholder="blur" />
      </Box>
    </Flex>
  </Box>
);

export default HomePage;
