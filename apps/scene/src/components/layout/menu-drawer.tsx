'use client';

import {
  CloseButton,
  Drawer,
  IconButton,
  Portal,
  Stack,
  useDisclosure,
} from '@chakra-ui/react';
import { FiMenu } from 'react-icons/fi';
import ROUTES from '@/constants/routes';

import LogoMark from '../icons/logo-mark';
import NavLink from './nav-link';

const MenuDrawer = () => {
  const { open, onClose, setOpen } = useDisclosure();

  const handleOpenChange = ({ open: nextOpen }: { open: boolean }) => {
    setOpen(nextOpen);
  };

  return (
    <Drawer.Root
      lazyMount
      onOpenChange={handleOpenChange}
      open={open}
      placement="start"
      size="xs"
    >
      <Drawer.Trigger asChild>
        <IconButton
          aria-label="開啟選單"
          display={{ base: 'inline-flex', lg: 'none' }}
          rounded="full"
          size="sm"
          variant="ghost"
        >
          <FiMenu />
        </IconButton>
      </Drawer.Trigger>
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content>
            <Drawer.Header gap="3">
              <LogoMark h="7" />
              <Drawer.Title textStyle="title-sm">台灣旅遊導覽網</Drawer.Title>
            </Drawer.Header>
            <Drawer.Body>
              <Stack aria-label="主要導覽" as="nav" gap="1">
                {ROUTES.map((route) => (
                  <NavLink
                    fontSize="lg"
                    href={route.href}
                    key={route.href}
                    onClick={onClose}
                    py="3"
                  >
                    {route.label}
                  </NavLink>
                ))}
              </Stack>
            </Drawer.Body>
            <Drawer.CloseTrigger asChild>
              <CloseButton aria-label="關閉選單" size="sm" />
            </Drawer.CloseTrigger>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
};

export default MenuDrawer;
