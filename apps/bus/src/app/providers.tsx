'use client';

import { ChakraProvider } from '@chakra-ui/react';
import { type ReactNode, useRef } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import AppShell from '@/components/app-shell';
import EmotionRegistry from '@/components/emotion-registry';
import MapContextProvider from '@/components/map-context-provider';
import { AppToaster } from '@/hooks/use-app-toast';
import { type AppStore, makeStore } from '@/redux/store';
import theme from '@/theme';

interface ProvidersProps {
  children: ReactNode;
}

const Providers = ({ children }: ProvidersProps) => {
  const storeRef = useRef<AppStore | null>(null);

  if (storeRef.current === null) {
    storeRef.current = makeStore();
  }

  return (
    <EmotionRegistry>
      <ReduxProvider store={storeRef.current}>
        <ChakraProvider value={theme}>
          <MapContextProvider>
            <AppShell>{children}</AppShell>
          </MapContextProvider>
          <AppToaster />
        </ChakraProvider>
      </ReduxProvider>
    </EmotionRegistry>
  );
};

export default Providers;
