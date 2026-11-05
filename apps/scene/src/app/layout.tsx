import type { Metadata, Viewport } from 'next';
import { Noto_Sans_TC } from 'next/font/google';
import type { ReactNode } from 'react';

import {
  DEFAULT_OG_IMAGE,
  OPEN_GRAPH_BASE,
  SITE_NAME,
  SITE_URL,
  TWITTER_BASE,
} from '@/lib/seo';
import Providers from './providers';

const notoSansTC = Noto_Sans_TC({
  display: 'swap',
  preload: false,
  variable: '--font-body',
  weight: ['400', '500', '700'],
});

const DESCRIPTION =
  '探索台灣各縣市的景點、美食、住宿與活動，資料來自交通部 TDX 觀光資訊。';

export const metadata: Metadata = {
  description: DESCRIPTION,
  icons: {
    apple: { sizes: '180x180', url: '/apple-touch-icon.png' },
    icon: [
      { sizes: '32x32', type: 'image/png', url: '/favicon-32x32.png' },
      { sizes: '16x16', type: 'image/png', url: '/favicon-16x16.png' },
    ],
    shortcut: '/favicon.ico',
  },
  manifest: '/manifest.json',
  metadataBase: SITE_URL,
  openGraph: {
    ...OPEN_GRAPH_BASE,
    description: DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
    title: SITE_NAME,
  },
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  twitter: TWITTER_BASE,
};

export const viewport: Viewport = {
  themeColor: [
    { color: '#FFFFFF', media: '(prefers-color-scheme: light)' },
    { color: '#09090B', media: '(prefers-color-scheme: dark)' },
  ],
};

const RootLayout = ({ children }: { children: ReactNode }) => (
  <html className={notoSansTC.variable} lang="zh-Hant" suppressHydrationWarning>
    <body>
      <Providers>{children}</Providers>
    </body>
  </html>
);

export default RootLayout;
