'use client';

import {
  Button,
  Group,
  Icon,
  NativeSelect,
  Popover,
  Portal,
  Stack,
  Text,
} from '@chakra-ui/react';
import { CityMap, counties, majorCities } from '@f2e/tdx-core';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import type { ChangeEvent } from 'react';
import { FiMapPin, FiMonitor, FiMoon, FiSettings, FiSun } from 'react-icons/fi';

import { CITY_SCOPED_PATHS, toPreferredCity } from '@/constants/preferences';
import usePreferredCity from '@/hooks/use-preferred-city';

const THEMES = [
  { icon: FiSun, label: '淺色', value: 'light' },
  { icon: FiMoon, label: '深色', value: 'dark' },
  { icon: FiMonitor, label: '系統', value: 'system' },
] as const;

/** Header dropdown for browser-only preferences: preferred city and theme. */
const PreferencesMenu = () => {
  const { city, ready, setCity } = usePreferredCity();
  const { setTheme, theme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();

  const handleCity = (event: ChangeEvent<HTMLSelectElement>) => {
    const next = toPreferredCity(event.target.value);
    setCity(next);

    // Re-scope the list on screen right away; other pages pick it up on visit.
    if (CITY_SCOPED_PATHS.includes(pathname)) {
      const params = new URLSearchParams(window.location.search);
      params.delete('page');
      if (next) {
        params.set('city', next);
      } else {
        params.delete('city');
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    }
  };

  const cityLabel = ready && city ? CityMap[city] : '全台';

  return (
    <Popover.Root positioning={{ placement: 'bottom-end' }}>
      <Popover.Trigger asChild>
        <Button aria-label="偏好設定" rounded="full" size="sm" variant="ghost">
          <FiMapPin />
          <Text display={{ base: 'none', sm: 'inline' }}>{cityLabel}</Text>
          <Icon color="fg.muted" display={{ base: 'none', sm: 'inline' }}>
            <FiSettings />
          </Icon>
        </Button>
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content w="72">
            <Popover.Arrow />
            <Popover.Body>
              <Stack gap="5">
                <Stack gap="2">
                  <Text fontWeight="semibold" textStyle="body-sm">
                    偏好縣市
                  </Text>
                  <NativeSelect.Root size="sm">
                    <NativeSelect.Field
                      aria-label="偏好縣市"
                      onChange={handleCity}
                      value={ready ? (city ?? '') : ''}
                    >
                      <option value="">全台（不限縣市）</option>
                      <optgroup label="直轄市">
                        {majorCities.map((item) => (
                          <option key={item} value={item}>
                            {CityMap[item]}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="縣市">
                        {counties.map((item) => (
                          <option key={item} value={item}>
                            {CityMap[item]}
                          </option>
                        ))}
                      </optgroup>
                    </NativeSelect.Field>
                    <NativeSelect.Indicator />
                  </NativeSelect.Root>
                  <Text color="fg.muted" textStyle="body-sm">
                    景點、美食、住宿、活動與搜尋會只顯示這個縣市，僅儲存在此瀏覽器。
                  </Text>
                </Stack>
                <Stack gap="2">
                  <Text fontWeight="semibold" textStyle="body-sm">
                    外觀
                  </Text>
                  <Group attached w="full">
                    {THEMES.map((option) => {
                      const active = ready && theme === option.value;

                      return (
                        <Button
                          aria-pressed={active}
                          flex="1"
                          key={option.value}
                          // biome-ignore lint/performance/noJsxPropsBind: each button sets its own theme value.
                          onClick={() => setTheme(option.value)}
                          size="sm"
                          variant={active ? 'solid' : 'outline'}
                        >
                          <option.icon />
                          {option.label}
                        </Button>
                      );
                    })}
                  </Group>
                </Stack>
              </Stack>
            </Popover.Body>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
};

export default PreferencesMenu;
