'use client';

import { Box, Flex, IconButton, Image, Text } from '@chakra-ui/react';
import {
  type KeyboardEvent,
  type SyntheticEvent,
  useCallback,
  useState,
} from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

import type { PlaceImage } from '@/types/place';

const FALLBACK = '/static/fallback-lg.jpg';

const swapToFallback = (event: SyntheticEvent<HTMLImageElement>) => {
  event.currentTarget.src = FALLBACK;
};

const Thumb = ({
  active,
  image,
  index,
  onSelect,
}: {
  active: boolean;
  image: PlaceImage;
  index: number;
  onSelect: (index: number) => void;
}) => {
  const onClick = useCallback(() => onSelect(index), [index, onSelect]);

  return (
    <Box
      aria-current={active}
      aria-label={`顯示第 ${index + 1} 張圖片`}
      as="button"
      borderColor={active ? 'colorPalette.solid' : 'transparent'}
      borderRadius="md"
      borderWidth="2px"
      flex="none"
      onClick={onClick}
      overflow="hidden"
      w="20"
    >
      <Image
        alt=""
        aspectRatio={4 / 3}
        decoding="async"
        loading="lazy"
        objectFit="cover"
        onError={swapToFallback}
        src={image.url}
        w="full"
      />
    </Box>
  );
};

const Gallery = ({ images, name }: { images: PlaceImage[]; name: string }) => {
  const list = images.length > 0 ? images : [{ url: FALLBACK }];
  const [index, setIndex] = useState(0);
  const current = list[index] ?? list[0];
  const many = list.length > 1;
  const count = list.length;
  const prev = useCallback(
    () => setIndex((value) => (value - 1 + count) % count),
    [count],
  );
  const next = useCallback(
    () => setIndex((value) => (value + 1) % count),
    [count],
  );
  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        prev();
      } else if (event.key === 'ArrowRight') {
        next();
      }
    },
    [next, prev],
  );

  return (
    <Box
      aria-label={`${name} 圖片集`}
      aria-roledescription="carousel"
      onKeyDown={many ? onKeyDown : undefined}
      role="group"
    >
      <Box
        bg="bg.muted"
        borderRadius="xl"
        overflow="hidden"
        position="relative"
      >
        <Image
          alt={current.caption || name}
          aspectRatio={16 / 9}
          decoding="async"
          loading={index === 0 ? 'eager' : 'lazy'}
          objectFit="cover"
          onError={swapToFallback}
          src={current.url}
          w="full"
        />
        {many ? (
          <>
            <IconButton
              aria-label="上一張"
              colorPalette="gray"
              left="2"
              onClick={prev}
              position="absolute"
              rounded="full"
              size="sm"
              top="50%"
              transform="translateY(-50%)"
              variant="solid"
            >
              <FiChevronLeft />
            </IconButton>
            <IconButton
              aria-label="下一張"
              colorPalette="gray"
              onClick={next}
              position="absolute"
              right="2"
              rounded="full"
              size="sm"
              top="50%"
              transform="translateY(-50%)"
              variant="solid"
            >
              <FiChevronRight />
            </IconButton>
          </>
        ) : null}
      </Box>
      <Flex align="center" color="fg.muted" gap="2" mt="2">
        <Text aria-live="polite" flex="1" textStyle="body-sm">
          {current.caption}
        </Text>
        {many ? (
          <Text textStyle="body-sm">
            {index + 1} / {list.length}
          </Text>
        ) : null}
      </Flex>
      {many ? (
        <Flex gap="2" mt="2" overflowX="auto" pb="1">
          {list.map((image, i) => (
            <Thumb
              active={i === index}
              image={image}
              index={i}
              key={image.url}
              onSelect={setIndex}
            />
          ))}
        </Flex>
      ) : null}
    </Box>
  );
};

export default Gallery;
