'use client';

import {
  createToaster,
  Portal,
  Stack,
  Toast,
  Toaster,
  type ToastOptions,
} from '@chakra-ui/react';
import { useCallback } from 'react';

interface AppToastOptions extends Omit<ToastOptions, 'type'> {
  status?: ToastOptions['type'];
}

const toaster = createToaster({ placement: 'bottom' });

export const AppToaster = () => (
  <Portal>
    <Toaster toaster={toaster}>
      {(toast) => (
        <Toast.Root borderLeftWidth="4px" maxW="md">
          <Toast.Indicator />
          <Stack flex="1" gap="1" maxW="full">
            {Boolean(toast.title) && <Toast.Title>{toast.title}</Toast.Title>}
            {Boolean(toast.description) && (
              <Toast.Description>{toast.description}</Toast.Description>
            )}
          </Stack>
          {Boolean(toast.closable) && <Toast.CloseTrigger />}
        </Toast.Root>
      )}
    </Toaster>
  </Portal>
);

/** Shows a closable toast; `status` defaults to success. */
export const useAppToast = () =>
  useCallback(
    ({ status = 'success', closable = true, ...options }: AppToastOptions) =>
      toaster.create({ ...options, closable, type: status }),
    [],
  );
