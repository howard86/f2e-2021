'use client';

import { Button, chakra, Input, NativeSelect } from '@chakra-ui/react';
import { type City, CityMap, counties, majorCities } from '@f2e/tdx-core';
import { RouteLink } from '@f2e/ui/links';
import { useRouter } from 'next/navigation';
import {
  type ChangeEvent,
  type FormEvent,
  useState,
  useTransition,
} from 'react';

import { ALL_CITIES } from '@/constants/preferences';
import {
  type EventsWhen,
  eventsPath,
  listPath,
  type PathCity,
} from '@/lib/list-paths';
import type { PlaceType, TagOption } from '@/types/place';

interface FilterBarProps {
  /** Current path values; the path is the only state. */
  city?: PathCity;
  showKeyword?: boolean;
  tag?: string;
  tagOptions?: TagOption[];
  type: PlaceType;
  /** Events only: the active tab, kept when the city changes. */
  when?: EventsWhen;
}

const CityOptions = ({ cities }: { cities: City[] }) =>
  cities.map((city) => (
    <option key={city} value={city}>
      {CityMap[city]}
    </option>
  ));

const FilterBar = ({
  city,
  showKeyword = true,
  tag,
  tagOptions = [],
  type,
  when,
}: FilterBarProps) => {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [keyword, setKeyword] = useState('');

  const realCity = city && city !== ALL_CITIES ? city : undefined;
  const hasFilters = Boolean(realCity || tag);
  const pathFor = (next: { city?: PathCity; tag?: string }) =>
    type === 'activity'
      ? eventsPath({ city: next.city, when })
      : listPath({ ...next, type });

  const navigate = (href: string) => {
    startTransition(() => {
      router.push(href, { scroll: false });
    });
  };

  // Keywords are unbounded, so they go to the dynamic search page.
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const q = keyword.trim();

    if (!q) {
      return;
    }

    const params = new URLSearchParams({ q });
    if (realCity) {
      params.set('city', realCity);
    }
    navigate(`/search?${params.toString()}`);
  };

  const handleCity = (event: ChangeEvent<HTMLSelectElement>) => {
    navigate(pathFor({ city: event.target.value as PathCity, tag }));
  };

  const handleTag = (event: ChangeEvent<HTMLSelectElement>) => {
    navigate(pathFor({ city, tag: event.target.value || undefined }));
  };

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
        <RouteLink href={pathFor({})} textStyle="body-sm">
          清除篩選
        </RouteLink>
      ) : null}
    </chakra.form>
  );
};

export default FilterBar;
