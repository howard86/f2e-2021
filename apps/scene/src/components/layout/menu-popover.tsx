'use client';

import {
  IconButton,
  type IconButtonProps,
  Popover,
  Portal,
  Separator,
  useDisclosure,
  VStack,
} from '@chakra-ui/react';
import { RouteLink } from '@f2e/ui/links';
import { FiMenu } from 'react-icons/fi';
import ROUTES from '@/constants/routes';

interface MenuPopoverProps
  extends Omit<Popover.RootProps, 'children' | 'open' | 'onOpenChange'> {
  buttonBgColor: IconButtonProps['bgColor'];
}

const MenuPopover = ({ buttonBgColor, ...props }: MenuPopoverProps) => {
  const { open, onClose, setOpen } = useDisclosure();

  return (
    <Popover.Root
      lazyMount
      // biome-ignore lint/performance/noJsxPropsBind: callback needs local render state or the current event target.
      onOpenChange={({ open: nextOpen }) => setOpen(nextOpen)}
      open={open}
      positioning={{ placement: 'right-start' }}
      {...props}
    >
      <Popover.Trigger asChild>
        <IconButton
          aria-label="open menu"
          bgColor={buttonBgColor}
          display={['inline-flex', 'none']}
          fontSize="2xl"
          p="1"
          variant="ghost"
        >
          <FiMenu />
        </IconButton>
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content borderRightRadius="2xl" w="120px">
            <Popover.Body>
              <VStack
                borderRadius="inherit"
                color="blackAlpha.800"
                fontSize="lg"
                gap={2}
                separator={<Separator />}
              >
                {ROUTES.map((route) => (
                  <RouteLink
                    _hover={{ color: 'colorPalette.solid' }}
                    href={route.href}
                    key={route.label}
                    onClick={onClose}
                  >
                    {route.label}
                  </RouteLink>
                ))}
              </VStack>
            </Popover.Body>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
};

export default MenuPopover;
