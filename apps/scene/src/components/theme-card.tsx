'use client';

import {
  Box,
  Flex,
  Image,
  LinkBox,
  type LinkBoxProps,
  LinkOverlay,
  Text,
  useSlotRecipe,
} from '@chakra-ui/react';

import { RouteLink } from '@f2e/ui/links';

interface ThemeCardProps extends LinkBoxProps {
  href?: string;
  id: string;
  image: string;
  theme: string;
}

const ThemeCard = ({ id, theme, image, href, ...props }: ThemeCardProps) => {
  const styles = useSlotRecipe({ key: 'imageCard' })({ rounded: '3xl' });

  return (
    <LinkBox css={styles.root} h="420" {...props}>
      <Image
        alt={theme}
        css={styles.image}
        objectPosition="center"
        // biome-ignore lint/performance/noJsxPropsBind: callback needs local render state or the current event target.
        onError={(event) => {
          event.currentTarget.src = '/static/fallback.jpg';
        }}
        src={image}
      />
      <Flex css={styles.overlay}>
        <Box flexGrow={1} />
        <Box>
          <Text
            as="h3"
            bgColor="blackAlpha.600"
            color="white"
            css={styles.title}
            fontSize={['xl', '2xl']}
            p="4"
          >
            {href ? (
              <LinkOverlay href={href} rel="noreferrer" target="_blank">
                {theme}
              </LinkOverlay>
            ) : (
              <RouteLink as={LinkOverlay} href={`/scenes/${theme}`}>
                {theme}
              </RouteLink>
            )}
          </Text>
        </Box>
      </Flex>
    </LinkBox>
  );
};

export default ThemeCard;
