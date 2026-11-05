'use client';

import { Button } from '@chakra-ui/react';
import { useCallback } from 'react';
import { BsBookmark, BsBookmarkFill } from 'react-icons/bs';

import useSaved from '@/hooks/use-saved';
import type { PlaceDetail, PlaceSummary } from '@/types/place';

const toSummary = (detail: PlaceDetail): PlaceSummary => ({
  city: detail.city,
  citySlug: detail.citySlug,
  endDate: detail.endDate,
  href: detail.href,
  id: detail.id,
  image: detail.image ?? detail.images[0],
  isFree: detail.isFree,
  keyFact: detail.keyFact,
  name: detail.name,
  startDate: detail.startDate,
  tags: detail.tags,
  town: detail.town,
  type: detail.type,
});

const SaveButton = ({ detail }: { detail: PlaceDetail }) => {
  const { isSaved, ready, toggle } = useSaved();
  const saved = ready && isSaved(detail.href);
  const onClick = useCallback(
    () => toggle(toSummary(detail)),
    [detail, toggle],
  );

  return (
    <Button
      aria-pressed={saved}
      colorPalette="gray"
      onClick={onClick}
      size="sm"
      variant={saved ? 'solid' : 'outline'}
    >
      {saved ? <BsBookmarkFill /> : <BsBookmark />}
      {saved ? '已收藏' : '收藏'}
    </Button>
  );
};

export default SaveButton;
