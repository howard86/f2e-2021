import {
  Box,
  Container,
  type ContainerProps,
  SimpleGrid,
} from '@chakra-ui/react';
import Image, { type StaticImageData } from 'next/image';
import type { ReactNode } from 'react';

import Logo from './icons/logo';

interface BackgroundProps extends ContainerProps {
  bgColor: ContainerProps['bgColor'];
  children: ReactNode;
  image: string | StaticImageData;
  name: string;
  wordOne: string | StaticImageData;
  wordOneAlt: string;
  wordTwo: string | StaticImageData;
  wordTwoAlt: string;
}

const Background = ({
  children,
  image,
  name,
  wordOne,
  wordOneAlt,
  wordTwo,
  wordTwoAlt,
  bgColor,
  ...props
}: BackgroundProps) => (
  <Container
    centerContent
    h="100vh"
    maxH={[589, 700]}
    maxW="full"
    px="0"
    {...props}
  >
    <Box
      bgColor={bgColor}
      h="inherit"
      left="0"
      maxH="inherit"
      overflow="hidden"
      pos="absolute"
      right="0"
      top="0"
      zIndex="hide"
    >
      <Image
        alt={`${name}背景`}
        fill
        placeholder="blur"
        priority
        sizes="100vw"
        src={image}
        style={{
          objectFit: 'cover',
          objectPosition: '20% 100%',
        }}
      />
    </Box>
    <Container centerContent maxW="5xl">
      <Logo
        color="whiteAlpha.700"
        h="auto"
        maxH="117"
        maxW="152"
        my={[8, 12]}
        w="30%"
      />
      <SimpleGrid columns={2} gap={[2, 4, 8]} mx="10%">
        <Image
          alt={wordOneAlt}
          placeholder="blur"
          priority
          src={wordOne}
          style={{
            height: 'auto',
            maxWidth: '100%',
          }}
        />
        <Image
          alt={wordTwoAlt}
          placeholder="blur"
          priority
          src={wordTwo}
          style={{
            height: 'auto',
            maxWidth: '100%',
          }}
        />
      </SimpleGrid>
      {children}
    </Container>
  </Container>
);

export default Background;
