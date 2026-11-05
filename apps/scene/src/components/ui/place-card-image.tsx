'use client';

import { Image } from '@chakra-ui/react';
import type { SyntheticEvent } from 'react';

const FALLBACK_SRC = '/static/fallback.jpg';

interface PlaceCardImageProps {
  alt: string;
  src?: string;
}

// Remote TDX photos can 404 or be missing; swap in the fallback once.
const PlaceCardImage = ({ alt, src }: PlaceCardImageProps) => {
  const handleError = (event: SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    if (!img.src.endsWith(FALLBACK_SRC)) {
      img.src = FALLBACK_SRC;
    }
  };

  return (
    <Image
      alt={alt}
      aspectRatio={4 / 3}
      bg="bg.muted"
      decoding="async"
      loading="lazy"
      objectFit="cover"
      onError={handleError}
      src={src ?? FALLBACK_SRC}
      w="full"
    />
  );
};

export default PlaceCardImage;
