'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

import Layout from './layout';

interface AppShellProps {
  children: ReactNode;
}

/**
 * Keeps one persistent Layout (and its mapbox container) mounted across
 * navigations, and derives the per-page layout props from the pathname.
 */
const AppShell = ({ children }: AppShellProps) => {
  const pathname = usePathname();
  const isNearby = pathname === '/nearby';
  const isRoute = pathname.startsWith('/city/');

  return (
    <Layout hideLocate={isNearby} showMap={isNearby || isRoute}>
      {children}
    </Layout>
  );
};

export default AppShell;
