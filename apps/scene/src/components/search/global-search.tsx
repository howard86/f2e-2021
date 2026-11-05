'use client';

import {
  Box,
  Button,
  CloseButton,
  Dialog,
  Flex,
  HStack,
  Input,
  Kbd,
  Portal,
  Text,
} from '@chakra-ui/react';
import { Cities, type City, CityMap } from '@f2e/tdx-core';
import { useRouter } from 'next/navigation';
import {
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { FiSearch } from 'react-icons/fi';

import { PLACE_LABEL, type PlaceSummary } from '@/types/place';

const APPLE_PLATFORM = /Mac|iPhone|iPad/u;
const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;
const MAX_SUGGESTIONS = 8;
const MAX_CITY_SHORTCUTS = 3;

interface Suggestion {
  href: string;
  key: string;
  meta: string;
  title: string;
}

const normalise = (value: string) =>
  value.trim().toLowerCase().replaceAll('台', '臺');

const matchCities = (query: string): City[] => {
  const text = normalise(query);

  if (!text) {
    return [];
  }

  return Cities.filter(
    (city) => CityMap[city].includes(text) || city.toLowerCase().includes(text),
  ).slice(0, MAX_CITY_SHORTCUTS);
};

const toSuggestion = (place: PlaceSummary): Suggestion => ({
  href: place.href,
  key: place.href,
  meta: [PLACE_LABEL[place.type], place.city, place.town]
    .filter(Boolean)
    .join(' · '),
  title: place.name,
});

const fetchSuggestions = async (query: string, signal: AbortSignal) => {
  const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
    signal,
  });

  if (!response.ok) {
    return [];
  }

  const body = (await response.json()) as {
    data?: PlaceSummary[];
    success: boolean;
  };

  return body.success && body.data
    ? body.data.slice(0, MAX_SUGGESTIONS).map(toSuggestion)
    : [];
};

interface SuggestionOptionProps {
  active: boolean;
  id: string;
  index: number;
  item: Suggestion;
  onActivate: (index: number) => void;
  onSelect: (href: string) => void;
}

const SuggestionOption = ({
  active,
  id,
  index,
  item,
  onActivate,
  onSelect,
}: SuggestionOptionProps) => {
  const handleClick = useCallback(() => onSelect(item.href), [item, onSelect]);
  const handleEnter = useCallback(() => onActivate(index), [index, onActivate]);

  return (
    <Box
      aria-selected={active}
      as="li"
      bg={active ? 'bg.muted' : undefined}
      cursor="pointer"
      id={id}
      onClick={handleClick}
      onMouseEnter={handleEnter}
      px="3"
      py="2"
      role="option"
      rounded="md"
    >
      <Text lineClamp="1" textStyle="body">
        {item.title}
      </Text>
      <Text color="fg.muted" textStyle="body-sm">
        {item.meta}
      </Text>
    </Box>
  );
};

const GlobalSearch = () => {
  const router = useRouter();
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [places, setPlaces] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(-1);
  const [isMac, setIsMac] = useState(false);

  const trimmed = query.trim();
  const canSearch = trimmed.length >= MIN_QUERY_LENGTH;

  const items = useMemo<Suggestion[]>(
    () => [
      ...matchCities(trimmed).map((city) => ({
        href: `/${city}`,
        key: `city-${city}`,
        meta: '縣市導覽',
        title: CityMap[city],
      })),
      ...(canSearch ? places : []),
    ],
    [canSearch, places, trimmed],
  );

  useEffect(() => {
    setIsMac(APPLE_PLATFORM.test(navigator.platform));
  }, []);

  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (!(open && canSearch)) {
      setPlaces([]);
      setLoading(false);

      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);

      try {
        setPlaces(await fetchSuggestions(trimmed, controller.signal));
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error(error);
          setPlaces([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [open, canSearch, trimmed]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
    setActive(-1);
  }, []);

  const go = useCallback(
    (href: string) => {
      close();
      router.push(href);
    },
    [close, router],
  );

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
    setActive(-1);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' && items.length > 0) {
      event.preventDefault();
      setActive((index) => (index + 1) % items.length);
    } else if (event.key === 'ArrowUp' && items.length > 0) {
      event.preventDefault();
      setActive((index) => (index <= 0 ? items.length - 1 : index - 1));
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const selected = items[active];

    if (selected) {
      go(selected.href);
    } else if (trimmed) {
      go(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  };

  const handleOpenChange = ({ open: next }: { open: boolean }) => {
    if (next) {
      setOpen(true);
    } else {
      close();
    }
  };

  const getInputElement = useCallback(() => inputRef.current, []);

  const openDialog = () => setOpen(true);

  return (
    <>
      <Button
        aria-keyshortcuts="Control+K Meta+K"
        aria-label="搜尋"
        onClick={openDialog}
        size="sm"
        variant="subtle"
      >
        <FiSearch />
        <Text as="span" display={{ base: 'none', md: 'inline' }}>
          搜尋
        </Text>
        <Kbd display={{ base: 'none', md: 'inline-flex' }}>
          {isMac ? '⌘K' : 'Ctrl K'}
        </Kbd>
      </Button>
      <Dialog.Root
        initialFocusEl={getInputElement}
        lazyMount
        onOpenChange={handleOpenChange}
        open={open}
        placement="top"
        scrollBehavior="inside"
        unmountOnExit
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content mt={{ base: 4, md: 20 }}>
              <Dialog.Header>
                <Dialog.Title>搜尋景點、美食、住宿與活動</Dialog.Title>
              </Dialog.Header>
              <Dialog.CloseTrigger asChild>
                <CloseButton
                  aria-label="關閉"
                  pos="absolute"
                  right="2"
                  top="2"
                />
              </Dialog.CloseTrigger>
              <Dialog.Body pb="6">
                <form onSubmit={handleSubmit}>
                  <Flex align="center" gap="2">
                    <Input
                      aria-activedescendant={
                        active >= 0 ? `${listId}-${active}` : undefined
                      }
                      aria-autocomplete="list"
                      aria-controls={listId}
                      aria-expanded={items.length > 0}
                      aria-label="搜尋關鍵字"
                      autoComplete="off"
                      name="q"
                      onChange={handleChange}
                      onKeyDown={handleKeyDown}
                      placeholder="輸入關鍵字或縣市"
                      ref={inputRef}
                      role="combobox"
                      value={query}
                    />
                    <Button disabled={!trimmed} type="submit">
                      搜尋
                    </Button>
                  </Flex>
                </form>
                <Box
                  aria-label="搜尋建議"
                  as="ul"
                  id={listId}
                  listStyleType="none"
                  mt="3"
                  role="listbox"
                >
                  {items.map((item, index) => (
                    <SuggestionOption
                      active={index === active}
                      id={`${listId}-${index}`}
                      index={index}
                      item={item}
                      key={item.key}
                      onActivate={setActive}
                      onSelect={go}
                    />
                  ))}
                </Box>
                <Text
                  aria-live="polite"
                  color="fg.muted"
                  mt="3"
                  textStyle="body-sm"
                >
                  {(() => {
                    if (loading) {
                      return '搜尋中…';
                    }
                    if (trimmed && !canSearch) {
                      return `請輸入至少 ${MIN_QUERY_LENGTH} 個字`;
                    }
                    if (canSearch && items.length === 0) {
                      return '沒有符合的建議，按 Enter 查看完整搜尋結果';
                    }
                    return '';
                  })()}
                </Text>
                <HStack color="fg.subtle" mt="2" textStyle="body-sm">
                  <Kbd>↑</Kbd>
                  <Kbd>↓</Kbd>
                  <Text>選擇</Text>
                  <Kbd>Enter</Kbd>
                  <Text>前往</Text>
                </HStack>
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  );
};

export default GlobalSearch;
