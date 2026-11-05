import { Box, Flex, Heading, SimpleGrid, Text } from '@chakra-ui/react';
import Image, { type StaticImageData } from 'next/image';
import type { ReactNode } from 'react';

interface PageHeroProps {
  /** Content under the title, e.g. a search form or filters. */
  children?: ReactNode;
  /** Illustrated background (the existing /static/background art). */
  image: StaticImageData;
  /** 'lg' for home and category pages, 'md' for city and search pages. */
  size?: 'lg' | 'md';
  subtitle?: string;
  title: string;
  /** The two hand-lettered word images some category heroes use. */
  wordImages?: [StaticImageData, StaticImageData];
}

const HERO_MIN_HEIGHT = {
  lg: 'clamp(380px, 56vh, 560px)',
  md: '280px',
} as const;

// The only place the illustration appears: it fills the hero, and the text
// sits on a theme-coloured panel so it stays legible in light and dark.
const PageHero = ({
  children,
  image,
  size = 'lg',
  subtitle,
  title,
  wordImages,
}: PageHeroProps) => (
  <Box as="section" bg="bg.muted" overflow="hidden" position="relative">
    <Box _dark={{ filter: 'brightness(0.7)' }} inset="0" position="absolute">
      <Image
        alt=""
        fill
        placeholder="blur"
        priority
        sizes="100vw"
        src={image}
        style={{ objectFit: 'cover', objectPosition: '20% 100%' }}
      />
    </Box>
    <Flex
      align="center"
      direction="column"
      gap="4"
      justify="center"
      minH={HERO_MIN_HEIGHT[size]}
      position="relative"
      px={{ base: 4, md: 6 }}
      py={{ base: 8, md: 10 }}
    >
      {wordImages ? (
        <SimpleGrid columns={2} gap="3" maxW="sm" w="full">
          {wordImages.map((word) => (
            <Image
              alt=""
              key={word.src}
              placeholder="blur"
              priority
              src={word}
              style={{ height: 'auto', maxWidth: '100%' }}
            />
          ))}
        </SimpleGrid>
      ) : null}
      <Box
        backdropFilter="blur(12px)"
        bg="bg/85"
        borderWidth="1px"
        maxW="2xl"
        px={{ base: 5, md: 8 }}
        py={{ base: 4, md: 6 }}
        rounded="2xl"
        textAlign="center"
        w="full"
      >
        <Heading as="h1" textStyle={size === 'lg' ? 'display' : 'title-lg'}>
          {title}
        </Heading>
        {subtitle ? (
          <Text color="fg.muted" mt="2" textStyle="body">
            {subtitle}
          </Text>
        ) : null}
        {children ? <Box mt="4">{children}</Box> : null}
      </Box>
    </Flex>
  </Box>
);

export default PageHero;
