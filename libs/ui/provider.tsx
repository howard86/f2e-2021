'use client';

import { ChakraProvider, type SystemContext } from '@chakra-ui/react';
import type { ReactNode } from 'react';

import EmotionRegistry from './emotion-registry';
import { AppToaster } from './toast';

interface UiProviderProps {
  children: ReactNode;
  system: SystemContext;
}

/** Emotion SSR registry, Chakra with the app's system, and the toaster. */
export const UiProvider = ({ children, system }: UiProviderProps) => (
  <EmotionRegistry>
    <ChakraProvider value={system}>
      {children}
      <AppToaster />
    </ChakraProvider>
  </EmotionRegistry>
);
