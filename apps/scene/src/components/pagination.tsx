'use client';

import {
  Button,
  ButtonGroup,
  type ButtonGroupProps,
  IconButton,
} from '@chakra-ui/react';
import type { Dispatch, SetStateAction } from 'react';
import { BiChevronLeft, BiChevronRight } from 'react-icons/bi';

interface PaginationProps extends Omit<ButtonGroupProps, 'page'> {
  colorTheme: string;
  onPageChange: Dispatch<SetStateAction<number>>;
  page: number; // page starts with 0
  total: number;
}

const Pagination = ({
  colorTheme,
  page,
  total,
  onPageChange,
  ...props
}: PaginationProps) => {
  if (total <= 1) {
    return null;
  }

  const isFirst = page === 0;
  const isLast = page === total - 1;

  const increment = () => onPageChange((current) => current + 1);
  const decrement = () => onPageChange((current) => current - 1);

  return (
    <ButtonGroup
      color={`${colorTheme}.main`}
      gap={6}
      variant="plain"
      {...props}
    >
      <IconButton
        aria-label="show previous page"
        disabled={isFirst}
        onClick={decrement}
      >
        <BiChevronLeft />
      </IconButton>
      <Button disabled={isFirst} onClick={decrement}>
        {isFirst ? null : page.toString()}
      </Button>
      <Button
        _hover={{ bg: `${colorTheme}.light` }}
        bg={`${colorTheme}.main`}
        color="white"
      >
        {page + 1}
      </Button>
      <Button disabled={isLast} onClick={increment}>
        {isLast ? '' : page + 2}
      </Button>
      <IconButton
        aria-label="show next page"
        disabled={isLast}
        onClick={increment}
      >
        <BiChevronRight />
      </IconButton>
    </ButtonGroup>
  );
};

export default Pagination;
