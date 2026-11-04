'use client';

import {
  Box,
  Flex,
  LinkBox,
  type LinkBoxProps,
  LinkOverlay,
  Text,
  useSlotRecipe,
} from '@chakra-ui/react';
import Image, { type StaticImageData } from 'next/image';

import RouteLink from './route-link';

interface SiteCardProps extends LinkBoxProps {
  href: string;
  image: string | StaticImageData;
  title: string;
}

const SiteCard = ({ title, href, image, ...props }: SiteCardProps) => {
  const styles = useSlotRecipe({ key: 'imageCard' })({ rounded: '3xl' });

  return (
    <LinkBox css={styles.root} overflow="visible" {...props}>
      <Image
        alt={title}
        placeholder="blur"
        src={image}
        style={{
          height: 'auto',
          maxWidth: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
        }}
      />
      <Flex
        _hover={{ boxShadow: '10px 10px 10px' }}
        align="flex-end"
        css={styles.overlay}
        rounded="3xl"
      >
        <Box
          bg="white"
          css={{ writingMode: 'vertical-rl' }}
          flexGrow={0}
          fontSize={['lg', '3xl']}
          fontWeight="bold"
          mr={[2, 4]}
          mt={[-3, -6]}
          py={[2, 4]}
          shadow="lg"
          textAlign="center"
        >
          <Text as="h2">
            <RouteLink
              _hover={{ textDecor: 'none' }}
              as={LinkOverlay}
              href={href}
            >
              {title}
            </RouteLink>
          </Text>
        </Box>
        <Box flexGrow={1} />
      </Flex>
    </LinkBox>
  );
};

export default SiteCard;
