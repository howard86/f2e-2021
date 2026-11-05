'use client';

import {
  Flex,
  type FlexProps,
  Icon,
  Image,
  LinkBox,
  LinkOverlay,
  Text,
  useSlotRecipe,
} from '@chakra-ui/react';
import { RouteLink } from '@f2e/ui/links';
import { FiMapPin } from 'react-icons/fi';

export interface PlaceCardProps extends FlexProps {
  address: string;
  city: string;
  contactNumber?: string;
  href: string;
  image: string;
  name: string;
  openingHours?: string;
  serviceInfo?: string;
}

const PlaceCard = ({
  name,
  city,
  address,
  openingHours,
  contactNumber,
  serviceInfo,
  image,
  href,
}: PlaceCardProps) => {
  const styles = useSlotRecipe({ key: 'imageCard' })({ rounded: '2xl' });

  return (
    <LinkBox
      _hover={{
        boxShadow: '12px 12px 10px',
        color: 'blackAlpha.400',
      }}
      borderColor="blackAlpha.600"
      borderWidth="1px"
      css={styles.root}
      display="flex"
      flexDir="column"
      transition="ease-out"
      transitionDuration="0.2s"
    >
      <Image
        align="center"
        css={styles.image}
        height={300}
        // biome-ignore lint/performance/noJsxPropsBind: callback needs local render state or the current event target.
        onError={(event) => {
          event.currentTarget.src = '/static/fallback.jpg';
        }}
        src={image}
      />
      <Flex color="fg.muted" flexDir="column" lineHeight="6" m="4">
        <Flex fontWeight="bold" justify="space-between">
          <Text as="h3" color="fg" fontSize={['lg', 'xl']} my="2">
            <RouteLink as={LinkOverlay} href={href}>
              {name}
            </RouteLink>
          </Text>
          <Flex align="center" flexShrink={0} pb="4" pt="2">
            <Icon as={FiMapPin} boxSize={6} mr="1" />
            <Text as="span">{city}</Text>
          </Flex>
        </Flex>
        <Text fontWeight="bold">{address}</Text>
        {Boolean(contactNumber) && (
          <Text textStyle="body">電話：{contactNumber}</Text>
        )}
        {Boolean(openingHours) && (
          <Text textStyle="body">營業時間：{openingHours}</Text>
        )}
        {Boolean(serviceInfo) && <Text textStyle="body">{serviceInfo}</Text>}
      </Flex>
    </LinkBox>
  );
};

export default PlaceCard;
