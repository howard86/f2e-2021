import { Button, Flex, Text } from '@chakra-ui/react';
import NextLink from 'next/link';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

// Server-renderable: previous/next (and page number) links, no client state.
export interface PagerProps {
  /** Path of the list page, e.g. /scenes. */
  basePath: string;
  hasMore: boolean;
  /** 1-based current page. */
  page: number;
  /** Current query params to keep on every link; `page` is replaced. */
  searchParams: Record<string, string | undefined>;
}

const buildHref = (
  basePath: string,
  searchParams: PagerProps['searchParams'],
  page: number,
) => {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (key !== 'page' && value) {
      query.set(key, value);
    }
  }

  if (page > 1) {
    query.set('page', String(page));
  }

  const search = query.toString();
  return search ? `${basePath}?${search}` : basePath;
};

const Pager = ({ basePath, hasMore, page, searchParams }: PagerProps) => (
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
        <NextLink href={buildHref(basePath, searchParams, page - 1)} rel="prev">
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
        <NextLink href={buildHref(basePath, searchParams, page + 1)} rel="next">
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
