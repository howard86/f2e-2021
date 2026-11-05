import { Tag, Wrap } from '@chakra-ui/react';
import NextLink from 'next/link';

interface TagChipsProps {
  /** When set, each chip links to `${hrefBase}${encodeURIComponent(tag)}`. */
  hrefBase?: string;
  /** Show at most this many; the rest are dropped. */
  max?: number;
  tags: string[];
}

const TagChips = ({ tags, max, hrefBase }: TagChipsProps) => {
  const visible = max === undefined ? tags : tags.slice(0, max);

  if (visible.length === 0) {
    return null;
  }

  return (
    <Wrap gap="1.5">
      {visible.map((tag) =>
        hrefBase ? (
          <Tag.Root
            _hover={{ bg: 'bg.muted' }}
            asChild
            colorPalette="gray"
            key={tag}
            rounded="full"
            size="sm"
            variant="subtle"
          >
            <NextLink href={`${hrefBase}${encodeURIComponent(tag)}`}>
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
        ),
      )}
    </Wrap>
  );
};

export default TagChips;
