'use client';

import { Button } from '@chakra-ui/react';
import { useCallback } from 'react';
import { BsBookmark, BsBookmarkFill } from 'react-icons/bs';

import useSaved from '@/hooks/use-saved';
import type { PlaceSummary } from '@/types/place';

const SaveButton = ({ place }: { place: PlaceSummary }) => {
  const { isSaved, ready, toggle } = useSaved();
  const saved = ready && isSaved(place.href);
  const onClick = useCallback(() => toggle(place), [place, toggle]);

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
