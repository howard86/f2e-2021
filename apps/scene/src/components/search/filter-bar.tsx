'use client';

import { Button, chakra, Input, NativeSelect } from '@chakra-ui/react';
import { type City, CityMap, counties, majorCities } from '@f2e/tdx-core';
import { RouteLink } from '@f2e/ui/links';
import { usePathname, useRouter } from 'next/navigation';
import {
  type ChangeEvent,
  type FormEvent,
  useState,
  useTransition,
} from 'react';

import { ALL_CITIES } from '@/constants/preferences';
import type { TagOption } from '@/types/place';

import { buildHref } from './search-params';

interface FilterBarProps {
  /** Current URL values; the URL is the only state. */
  city?: City;
  /** Other params to carry over unchanged, e.g. `when`. */
  preserve?: Record<string, string | undefined>;
  q?: string;
  showKeyword?: boolean;
  tag?: string;
  tagOptions?: TagOption[];
}

const CityOptions = ({ cities }: { cities: City[] }) =>
  cities.map((city) => (
    <option key={city} value={city}>
      {CityMap[city]}
    </option>
  ));

const FilterBar = ({
  city,
  preserve = {},
  q,
  showKeyword = true,
  tag,
  tagOptions = [],
}: FilterBarProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [keyword, setKeyword] = useState(q ?? '');

  const hasFilters = Boolean(city || q || tag);

  const navigate = (next: Record<string, string | undefined>) => {
    startTransition(() => {
      router.replace(buildHref(pathname, { ...preserve, ...next }), {
        scroll: false,
      });
    });
  };

  const current = { city, q, tag };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate({ ...current, q: keyword.trim() || undefined });
  };

  const handleCity = (event: ChangeEvent<HTMLSelectElement>) => {
    navigate({ ...current, city: event.target.value });
  };

  const handleTag = (event: ChangeEvent<HTMLSelectElement>) => {
    navigate({ ...current, tag: event.target.value || undefined });
  };

  const handleClear = () => setKeyword('');

  const handleKeyword = (event: ChangeEvent<HTMLInputElement>) => {
    setKeyword(event.target.value);
  };

  return (
    <chakra.form
      alignItems={{ base: 'stretch', md: 'center' }}
      aria-busy={pending}
      display="flex"
      flexDirection={{ base: 'column', md: 'row' }}
      gap="3"
      onSubmit={handleSubmit}
      role="search"
    >
      {showKeyword ? (
        <>
          <chakra.label htmlFor="filter-q" srOnly>
            關鍵字
          </chakra.label>
          <Input
            flex="1"
            id="filter-q"
            minW="0"
            name="q"
            onChange={handleKeyword}
            placeholder="輸入關鍵字"
            value={keyword}
          />
        </>
      ) : null}
      <NativeSelect.Root maxW={{ md: '44' }}>
        <NativeSelect.Field
          aria-label="縣市"
          name="city"
          onChange={handleCity}
          value={city ?? ALL_CITIES}
        >
          {/* An explicit `all` keeps the preferred-city redirect from re-applying. */}
          <option value={ALL_CITIES}>全部縣市</option>
          <optgroup label="直轄市">
            <CityOptions cities={majorCities} />
          </optgroup>
          <optgroup label="縣市">
            <CityOptions cities={counties} />
          </optgroup>
        </NativeSelect.Field>
        <NativeSelect.Indicator />
      </NativeSelect.Root>
      {tagOptions.length > 0 ? (
        <NativeSelect.Root maxW={{ md: '52' }}>
          <NativeSelect.Field
            aria-label="分類"
            name="tag"
            onChange={handleTag}
            value={tag ?? ''}
          >
            <option value="">全部分類</option>
            {tagOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
      ) : null}
      {showKeyword ? (
        <Button loading={pending} type="submit">
          搜尋
        </Button>
      ) : null}
      {hasFilters ? (
        <RouteLink
          href={buildHref(pathname, preserve)}
          onClick={handleClear}
          textStyle="body-sm"
        >
          清除篩選
        </RouteLink>
      ) : null}
    </chakra.form>
  );
};

export default FilterBar;
