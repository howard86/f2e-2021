'use client';

import {
  Circle,
  Flex,
  type FlexProps,
  HStack,
  Icon,
  Text,
  useToken,
} from '@chakra-ui/react';
import { AiFillStar, AiOutlineEye } from 'react-icons/ai';
import { BsBookmarkPlus, BsBookmarkPlusFill } from 'react-icons/bs';

interface CardBannerProps extends FlexProps {
  rate: number;
  saved?: boolean;
  view: number;
}

const CardBanner = ({ rate, view, saved, ...props }: CardBannerProps) => {
  const size = useToken('boxSize', ['16px', '16px', '24px']);

  return (
    <Flex
      color="blackAlpha.400"
      justify="space-between"
      m={[3, 3, 4]}
      {...props}
    >
      <HStack
        bg="white"
        fontWeight="bold"
        gap={[1, 1, 2]}
        px={[2, 2, 4]}
        py={[1, 1, 2]}
        rounded="full"
        shadow="dark-lg"
      >
        <Icon as={AiFillStar} boxSize={size} color="yellow.300" />
        <Text as="span" color="blackAlpha.600">
          {rate}
        </Text>
        <Icon as={AiOutlineEye} boxSize={size} color="blackAlpha.500" />
        <Text as="span" color="blackAlpha.600">
          {view}
        </Text>
      </HStack>
      <Circle as="span" bgColor="white" rounded="full" size={[8, 8, 12]}>
        <Icon
          as={saved ? BsBookmarkPlusFill : BsBookmarkPlus}
          boxSize={size}
          color={saved ? 'red.600' : 'blackAlpha.600'}
        />
      </Circle>
    </Flex>
  );
};

export default CardBanner;
