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

interface BackgroundCardProps extends LinkBoxProps {
  href?: string;
  image: string;
  imageHeight?: number;
  imageWidth?: number;
  name: string;
}

const BackgroundCard = ({
  name,
  image,
  href = '#',
  ...props
}: BackgroundCardProps) => {
  const styles = useSlotRecipe({ key: 'imageCard' })({ rounded: 'xl' });

  return (
    <LinkBox css={styles.root} {...props}>
      <Image alt={name} css={styles.image} src={image} />
      <Flex css={styles.overlay} fontSize="sm" fontWeight="bold">
        <Box flexGrow={1} />
        <Flex
          align="center"
          bgColor="whiteAlpha.400"
          justify="space-between"
          p="2"
        >
          <Text
            as="h3"
            color="white"
            css={styles.title}
            fontSize={['sm', '2xl']}
          >
            <LinkOverlay href={href} rel="noreferrer" target="_blank">
              {name}
            </LinkOverlay>
          </Text>
        </Flex>
      </Flex>
    </LinkBox>
  );
};

export default BackgroundCard;
