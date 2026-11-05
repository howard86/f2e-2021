'use client';

import {
  Box,
  Flex,
  GridItem,
  type GridItemProps,
  Image,
  LinkBox,
  LinkOverlay,
  Text,
  useSlotRecipe,
} from '@chakra-ui/react';

import { RouteLink } from '@f2e/ui/links';

interface GridCardProps extends GridItemProps {
  href: string;
  image: string;
  isExternal?: boolean;
  subtitle?: string;
  title: string;
}

const GridCard = ({
  title,
  subtitle,
  image,
  href,
  isExternal,
  ...props
}: GridCardProps) => {
  const styles = useSlotRecipe({ key: 'imageCard' })({ rounded: '2xl' });

  return (
    <GridItem as={LinkBox} css={styles.root} {...props}>
      <Image
        align="center"
        alt={title}
        css={styles.image}
        // biome-ignore lint/performance/noJsxPropsBind: native image fallback needs the current event target.
        onError={(event) => {
          event.currentTarget.src = '/static/fallback.jpg';
        }}
        src={image}
      />
      <Flex css={styles.overlay} p={[2, 4]}>
        {isExternal ? (
          <LinkOverlay
            css={styles.title}
            fontSize="lg"
            href={href}
            rel="noreferrer"
            target="_blank"
          >
            {title}
          </LinkOverlay>
        ) : (
          <RouteLink as={LinkOverlay} href={href}>
            {title}
          </RouteLink>
        )}
        <Text>{subtitle}</Text>
        <Box flexGrow={1} />
      </Flex>
    </GridItem>
  );
};

export default GridCard;
