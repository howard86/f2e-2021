'use client';

import { UiProvider } from '@f2e/ui/provider';
import { type ReactNode, useRef } from 'react';
import { Provider as ReduxProvider } from 'react-redux';

import { type AppStore, makeStore } from '@/redux/store';
import system from '@/theme';

const Providers = ({ children }: { children: ReactNode }) => {
  const storeRef = useRef<AppStore | null>(null);

  if (storeRef.current === null) {
    storeRef.current = makeStore();
  }

  return (
    <UiProvider system={system}>
      <ReduxProvider store={storeRef.current}>{children}</ReduxProvider>
    </UiProvider>
  );
};

export default Providers;
