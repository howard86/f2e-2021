'use client';

import {
  Box,
  Button,
  type ButtonProps,
  Center,
  Heading,
  Stack,
  useBreakpointValue,
} from '@chakra-ui/react';
import { BiCurrentLocation } from 'react-icons/bi';
import { FaBusAlt } from 'react-icons/fa';

import bus from '@/bus.png';
import PinkLogoIcon from '@/components/icons/pink-logo';
import Image from '@/components/image';
import RouteLink from '@/components/route-link';
import human from '@/human.png';
import station from '@/station.png';

const HomeView = () => {
  const size = useBreakpointValue<ButtonProps['size']>({
    base: 'md',
    md: 'lg',
  });

  return (
    <Center
      color="white"
      flexDir="column"
      h="full"
      overflowX="hidden"
      pos="relative"
      px="8"
      zIndex="docked"
    >
      <PinkLogoIcon h="auto" maxW="217.5" minW="146" w="50%" />
      <Heading
        as="h1"
        fontSize={['xl', '2xl']}
        maxW="344"
        my="8"
        textAlign="center"
      >
        提供最即時的公車動態，讓您輕鬆掌握資訊，現在就開始規劃您的路線吧！
      </Heading>
      <Stack direction={['column', 'row']} gap={[4, 8]}>
        <Button asChild size={size} variant="outline">
          <RouteLink href="/city">
            <FaBusAlt />
            市區公車
          </RouteLink>
        </Button>
        <Button asChild size={size} variant="outline">
          <RouteLink href="/nearby">
            <BiCurrentLocation />
            附近站牌
          </RouteLink>
        </Button>
      </Stack>
      <Box
        bottom="5.6%"
        h={[70, 140]}
        pos="absolute"
        right="30%"
        w={[117, 234]}
      >
        <Image
          alt="station"
          height={140}
          placeholder="blur"
          src={station}
          width={234}
        />
      </Box>
      <Box
        animation="humanFade 20s ease-in-out infinite"
        bottom="4.9%"
        h={[55, 110]}
        pos="absolute"
        right="35%"
        w={[25, 50]}
      >
        <Image
          alt="human"
          height={110}
          placeholder="blur"
          src={human}
          width={50}
        />
      </Box>
      <Box
        animation="busTravel 10s ease-in-out infinite"
        bottom="4.5%"
        h={['60px', 120]}
        pos="absolute"
        w={[203, 406]}
      >
        <Image
          alt="bus"
          height={120}
          placeholder="blur"
          src={bus}
          width={406}
        />
      </Box>
    </Center>
  );
};

export default HomeView;
