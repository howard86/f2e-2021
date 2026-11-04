'use client';

import {
  Box,
  type BoxProps,
  IconButton,
  Input,
  InputGroup,
} from '@chakra-ui/react';
import type { ChangeEvent, FormEvent } from 'react';
import { FiSearch } from 'react-icons/fi';

interface SearchBarProps extends Omit<BoxProps, 'onSubmit'> {
  onSubmit: () => void;
  onValueChange: (value: string) => void;
  placeholder?: string;
  value: string;
}

const SearchBar = ({
  onSubmit,
  onValueChange,
  placeholder = '請輸入關鍵字',
  value,
  ...props
}: SearchBarProps) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onValueChange(event.target.value);
  };

  const handleSubmit = (event: FormEvent<HTMLDivElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <Box as="form" onSubmit={handleSubmit} w="full" {...props}>
      <InputGroup
        endElement={
          <IconButton
            aria-label="搜尋"
            rounded="full"
            type="submit"
            variant="ghost"
          >
            <FiSearch />
          </IconButton>
        }
        endElementProps={{ pointerEvents: 'auto' }}
      >
        <Input
          aria-label={placeholder}
          bg="white"
          onChange={handleChange}
          placeholder={placeholder}
          rounded="2xl"
          size="lg"
          value={value}
        />
      </InputGroup>
    </Box>
  );
};

export default SearchBar;
