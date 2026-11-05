'use client';

import { UiProvider } from '@f2e/ui/provider';
import { ThemeProvider } from 'next-themes';
import type { ReactNode } from 'react';

import system from '@/theme';

const Providers = ({ children }: { children: ReactNode }) => (
  <ThemeProvider attribute="class" disableTransitionOnChange>
    <UiProvider system={system}>{children}</UiProvider>
  </ThemeProvider>
);

export default Providers;
