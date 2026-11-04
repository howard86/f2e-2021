'use client';

import {
  Box,
  Flex,
  Icon,
  Image,
  LinkBox,
  type LinkBoxProps,
  LinkOverlay,
  Text,
  useSlotRecipe,
} from '@chakra-ui/react';
import { FiMapPin } from 'react-icons/fi';

import RouteLink from './route-link';

export interface SceneCardProps extends LinkBoxProps {
  city: string;
  href: string;
  image: string;
  name: string;
}

const SceneCard = ({ name, city, image, href }: SceneCardProps) => {
  const styles = useSlotRecipe({ key: 'imageCard' })({ rounded: '2xl' });

  return (
    <LinkBox css={styles.root} h={['380px', '420px', '420px', '500px']}>
      <Image
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
        <Flex
          bgColor="blackAlpha.500"
          color="white"
          display="flex"
          flexDir="column"
          p="4"
          roundedBottom="3xl"
          zIndex="docked"
        >
          <Text textStyle="headline-3">
            <RouteLink as={LinkOverlay} href={href}>
              {name}
            </RouteLink>
          </Text>
          <Flex alignSelf="flex-end" css={styles.meta}>
            <Icon as={FiMapPin} boxSize="24px" mr="1" />
            <Text as="span">{city}</Text>
          </Flex>
        </Flex>
      </Flex>
    </LinkBox>
  );
};

export default SceneCard;
