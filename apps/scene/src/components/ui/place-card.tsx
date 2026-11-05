import {
  Badge,
  Box,
  Flex,
  Icon,
  LinkBox,
  LinkOverlay,
  Text,
} from '@chakra-ui/react';
import { RouteLink } from '@f2e/ui/links';
import { FiMapPin } from 'react-icons/fi';
import { PLACE_CATEGORY, PLACE_LABEL, type PlaceSummary } from '@/types/place';

import PlaceCardImage from './place-card-image';
import TagChips from './tag-chips';

interface PlaceCardProps {
  place: PlaceSummary;
}

const PlaceCard = ({ place }: PlaceCardProps) => (
  <LinkBox
    _hover={{
      borderColor: 'border.emphasized',
      shadow: 'md',
      transform: 'translateY(-2px)',
    }}
    as="article"
    bg="bg"
    borderWidth="1px"
    css={{
      '&:has(:focus-visible)': {
        outlineColor: 'colorPalette.focusRing',
        outlineOffset: '2px',
        outlineStyle: 'solid',
        outlineWidth: '2px',
      },
    }}
    display="flex"
    flexDirection="column"
    h="full"
    overflow="hidden"
    rounded="xl"
    shadow="xs"
    transitionDuration="0.2s"
    transitionProperty="box-shadow, transform, border-color"
  >
    <PlaceCardImage alt="" src={place.image?.url} />
    <Flex direction="column" flexGrow={1} gap="2" p="4">
      <Box>
        <Badge
          colorPalette={PLACE_CATEGORY[place.type]}
          rounded="full"
          size="sm"
          variant="subtle"
        >
          {PLACE_LABEL[place.type]}
        </Badge>
      </Box>
      <RouteLink
        _hover={{ textDecoration: 'none' }}
        as={LinkOverlay}
        href={place.href}
        lineClamp={2}
        textStyle="title-sm"
      >
        {place.name}
      </RouteLink>
      <Flex align="center" color="fg.muted" gap="1" textStyle="body-sm">
        <Icon aria-hidden flexShrink={0}>
          <FiMapPin />
        </Icon>
        <Text lineClamp={1}>{place.town ?? place.city}</Text>
      </Flex>
      {place.tags.length > 0 && <TagChips max={2} tags={place.tags} />}
      {place.keyFact ? (
        <Text color="fg.muted" lineClamp={1} mt="auto" textStyle="body-sm">
          {place.keyFact}
        </Text>
      ) : null}
    </Flex>
  </LinkBox>
);

export default PlaceCard;
