'use client';

import { UiProvider } from '@f2e/ui/provider';
import type { ReactNode } from 'react';
import AppShell from '@/components/app-shell';
import MapContextProvider from '@/components/map-context-provider';
import theme from '@/theme';

interface ProvidersProps {
  children: ReactNode;
}

const Providers = ({ children }: ProvidersProps) => (
  <UiProvider system={theme}>
    <MapContextProvider>
      <AppShell>{children}</AppShell>
    </MapContextProvider>
  </UiProvider>
);

export default Providers;
