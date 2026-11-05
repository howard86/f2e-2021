'use client';

import {
  type BoxProps,
  Button,
  CloseButton,
  Dialog,
  Menu,
  Portal,
  SimpleGrid,
  useDisclosure,
} from '@chakra-ui/react';
import { type City, CityMap, counties, majorCities } from '@f2e/tdx-core';
import { useAppToast } from '@f2e/ui/toast';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FiSearch } from 'react-icons/fi';

const DEFAULT_MENU_VALUE = '選擇縣市' as const;

interface SceneModalProps
  extends Omit<Dialog.RootProps, 'children' | 'onOpenChange'> {
  onClose: () => void;
}

const SceneModal = ({ onClose, ...props }: SceneModalProps) => {
  const router = useRouter();
  const toast = useAppToast();
  const menu = useDisclosure();
  const [selectedCity, setSelectedCity] = useState<
    City | typeof DEFAULT_MENU_VALUE
  >(DEFAULT_MENU_VALUE);

  const onAdvanceSearch = () => {
    if (selectedCity !== DEFAULT_MENU_VALUE) {
      onClose();
      router.push(`/${selectedCity}`);
      return;
    }

    toast({ status: 'info', title: '請選擇主題或縣市' });
  };

  const menuGroupStyle: BoxProps = {
    bgColor: 'colorPalette.solid',
    color: 'white',
    fontSize: 'lg',
    m: 0,
    py: 2,
  };

  return (
    <Dialog.Root
      // biome-ignore lint/performance/noJsxPropsBind: callback needs local render state or the current event target.
      onOpenChange={({ open }) => {
        if (!open) {
          onClose();
        }
      }}
      scrollBehavior="inside"
      {...props}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header
              bgColor="colorPalette.solid"
              color="white"
              roundedTop="md"
            >
              <Dialog.Title>進階搜尋</Dialog.Title>
            </Dialog.Header>
            <Dialog.CloseTrigger asChild>
              <CloseButton color="white" pos="absolute" right="2" top="2" />
            </Dialog.CloseTrigger>
            <Dialog.Body mt="2">
              <Menu.Root
                lazyMount
                // biome-ignore lint/performance/noJsxPropsBind: callback needs local render state or the current event target.
                onOpenChange={({ open }) => menu.setOpen(open)}
                open={menu.open}
              >
                <Menu.Trigger asChild>
                  <Button flexShrink={0} variant="outline">
                    {CityMap[selectedCity] || selectedCity}
                  </Button>
                </Menu.Trigger>
                <Portal>
                  <Menu.Positioner>
                    <Menu.Content
                      minWidth="240px"
                      overflow="hidden"
                      pt="0"
                      textAlign="center"
                      zIndex="popover"
                    >
                      <Menu.ItemGroup {...menuGroupStyle}>
                        <Menu.ItemGroupLabel>6直轄市</Menu.ItemGroupLabel>
                        <SimpleGrid columns={[4, 5]} gap={2} m="2">
                          {majorCities.map((city) => (
                            <Menu.Item asChild key={city} value={city}>
                              <Button
                                // biome-ignore lint/performance/noJsxPropsBind: callback needs local render state or the current event target.
                                onClick={() => setSelectedCity(city)}
                                size="sm"
                                variant="outline"
                              >
                                {CityMap[city]}
                              </Button>
                            </Menu.Item>
                          ))}
                        </SimpleGrid>
                      </Menu.ItemGroup>
                      <Menu.ItemGroup {...menuGroupStyle}>
                        <Menu.ItemGroupLabel>16縣市</Menu.ItemGroupLabel>
                        <SimpleGrid columns={[4, 5]} gap={2} m="2">
                          {counties.map((city) => (
                            <Menu.Item asChild key={city} value={city}>
                              <Button
                                // biome-ignore lint/performance/noJsxPropsBind: callback needs local render state or the current event target.
                                onClick={() => setSelectedCity(city)}
                                size="sm"
                                variant="outline"
                              >
                                {CityMap[city]}
                              </Button>
                            </Menu.Item>
                          ))}
                        </SimpleGrid>
                      </Menu.ItemGroup>
                      <Menu.Separator />
                      <Menu.ItemGroup>
                        <Button onClick={menu.onClose} variant="subtle">
                          取消
                        </Button>
                      </Menu.ItemGroup>
                    </Menu.Content>
                  </Menu.Positioner>
                </Portal>
              </Menu.Root>
            </Dialog.Body>
            <Dialog.Footer justifyContent="center">
              <Button onClick={onAdvanceSearch} variant="subtle">
                <FiSearch />
                搜尋
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default SceneModal;
