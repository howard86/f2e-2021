'use client';

import {
  type CreateToasterProps,
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

const DEFAULT_OPTIONS: AppToastOptions = {
  closable: true,
  status: 'success',
};

const toaster = createToaster({
  placement: 'top-end',
} satisfies CreateToasterProps);

export const AppToaster = () => (
  <Portal>
    <Toaster toaster={toaster}>
      {(toast) => (
        <Toast.Root>
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

const useAppToast = (options: AppToastOptions = DEFAULT_OPTIONS) =>
  useCallback(
    ({ status, ...nextOptions }: AppToastOptions) =>
      toaster.create({
        ...DEFAULT_OPTIONS,
        ...options,
        ...nextOptions,
        type: status ?? options.status ?? DEFAULT_OPTIONS.status,
      }),
    [options],
  );

export default useAppToast;
