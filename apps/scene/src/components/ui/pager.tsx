import { Button, Flex, Text } from '@chakra-ui/react';
import NextLink from 'next/link';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

// Server-renderable: previous/next (and page number) links, no client state.
interface PagerProps {
  hasMore: boolean;
  /** Path of a 1-based page of the same list. */
  hrefForPage: (page: number) => string;
  /** 1-based current page. */
  page: number;
}

const Pager = ({ hasMore, hrefForPage, page }: PagerProps) => (
  <Flex
    align="center"
    aria-label="分頁"
    as="nav"
    gap="4"
    justify="center"
    mt="10"
  >
    {page > 1 ? (
      <Button asChild size="sm" variant="outline">
        <NextLink href={hrefForPage(page - 1)} rel="prev">
          <FiChevronLeft />
          上一頁
        </NextLink>
      </Button>
    ) : (
      <Button disabled size="sm" variant="outline">
        <FiChevronLeft />
        上一頁
      </Button>
    )}
    <Text aria-current="page" color="fg.muted" textStyle="body-sm">
      第 {page} 頁
    </Text>
    {hasMore ? (
      <Button asChild size="sm" variant="outline">
        <NextLink href={hrefForPage(page + 1)} rel="next">
          下一頁
          <FiChevronRight />
        </NextLink>
      </Button>
    ) : (
      <Button disabled size="sm" variant="outline">
        下一頁
        <FiChevronRight />
      </Button>
    )}
  </Flex>
);

export default Pager;
