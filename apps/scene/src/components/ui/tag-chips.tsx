import { Tag, Wrap } from '@chakra-ui/react';
import NextLink from 'next/link';

interface TagChipsProps {
  /** Where a chip links; a chip is plain text when this returns undefined. */
  hrefFor?: (tag: string) => string | undefined;
  /** Show at most this many; the rest are dropped. */
  max?: number;
  tags: string[];
}

const TagChips = ({ tags, max, hrefFor }: TagChipsProps) => {
  const visible = max === undefined ? tags : tags.slice(0, max);

  if (visible.length === 0) {
    return null;
  }

  return (
    <Wrap gap="1.5">
      {visible.map((tag) => {
        const href = hrefFor?.(tag);

        return href ? (
          <Tag.Root
            _hover={{ bg: 'bg.muted' }}
            asChild
            colorPalette="gray"
            key={tag}
            rounded="full"
            size="sm"
            variant="subtle"
          >
            <NextLink href={href}>
              <Tag.Label>{tag}</Tag.Label>
            </NextLink>
          </Tag.Root>
        ) : (
          <Tag.Root
            colorPalette="gray"
            key={tag}
            rounded="full"
            size="sm"
            variant="subtle"
          >
            <Tag.Label>{tag}</Tag.Label>
          </Tag.Root>
        );
      })}
    </Wrap>
  );
};

export default TagChips;
