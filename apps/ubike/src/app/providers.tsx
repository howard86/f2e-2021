'use client';

import { UiProvider } from '@f2e/ui/provider';
import type { ReactNode } from 'react';

import MapContextProvider from '@/components/map-context-provider';
import system from '@/theme';

interface ProvidersProps {
  children: ReactNode;
}

const Providers = ({ children }: ProvidersProps) => (
  <UiProvider system={system}>
    <MapContextProvider>{children}</MapContextProvider>
  </UiProvider>
);

export default Providers;
