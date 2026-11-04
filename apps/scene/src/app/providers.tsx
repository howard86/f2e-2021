'use client';

import { ChakraProvider } from '@chakra-ui/react';
import { type ReactNode, useRef } from 'react';
import { Provider as ReduxProvider } from 'react-redux';

import EmotionRegistry from '@/components/emotion-registry';

import { AppToaster } from '@/hooks/use-app-toast';
import { type AppStore, makeStore } from '@/redux/store';
import system from '@/theme';

const Providers = ({ children }: { children: ReactNode }) => {
  const storeRef = useRef<AppStore | null>(null);

  if (storeRef.current === null) {
    storeRef.current = makeStore();
  }

  return (
    <EmotionRegistry>
      <ReduxProvider store={storeRef.current}>
        <ChakraProvider value={system}>
          {children}
          <AppToaster />
        </ChakraProvider>
      </ReduxProvider>
    </EmotionRegistry>
  );
};

export default Providers;
