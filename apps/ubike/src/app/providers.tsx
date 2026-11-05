'use client';

import { UiProvider } from '@f2e/ui/provider';
import { type ReactNode, useRef } from 'react';
import { Provider as ReduxProvider } from 'react-redux';

import MapContextProvider from '@/components/map-context-provider';
import { type AppStore, makeStore } from '@/redux/store';
import system from '@/theme';

interface ProvidersProps {
  children: ReactNode;
}

const Providers = ({ children }: ProvidersProps) => {
  const storeRef = useRef<AppStore | null>(null);
  if (storeRef.current === null) {
    storeRef.current = makeStore();
  }

  return (
    <UiProvider system={system}>
      <ReduxProvider store={storeRef.current}>
        <MapContextProvider>{children}</MapContextProvider>
      </ReduxProvider>
    </UiProvider>
  );
};

export default Providers;
