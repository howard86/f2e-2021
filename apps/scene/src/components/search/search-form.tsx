import { Box, Button, Input, VisuallyHidden } from '@chakra-ui/react';
import { FiSearch } from 'react-icons/fi';

interface SearchFormProps {
  defaultValue?: string;
  /** Distinguishes the input id when two forms share a page. */
  id?: string;
}

/** Plain GET form to /search; works without JavaScript. */
const SearchForm = ({ defaultValue, id = 'search-q' }: SearchFormProps) => (
  <Box asChild maxW="2xl" w="full">
    <search>
      <Box
        asChild
        bg="bg"
        display="flex"
        gap="2"
        p="2"
        rounded="xl"
        shadow="md"
        w="full"
      >
        <form action="/search" method="get">
          <VisuallyHidden asChild>
            <label htmlFor={id}>搜尋景點、美食、住宿與活動</label>
          </VisuallyHidden>
          <Input
            border="none"
            defaultValue={defaultValue}
            flex="1"
            id={id}
            name="q"
            placeholder="搜尋景點、美食、住宿或活動"
            size="lg"
          />
          <Button size="lg" type="submit">
            <FiSearch />
            搜尋
          </Button>
        </form>
      </Box>
    </search>
  </Box>
);

export default SearchForm;
