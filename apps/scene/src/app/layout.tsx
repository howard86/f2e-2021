import type { Metadata } from 'next';
import { Noto_Sans_TC } from 'next/font/google';
import type { ReactNode } from 'react';

import Providers from './providers';

const notoSansTC = Noto_Sans_TC({
  display: 'swap',
  preload: false,
  variable: '--font-noto-sans-tc',
  weight: ['400', '500', '700'],
});

const DESCRIPTION =
  '以插畫呈現台灣風景，搭配客家花布常出現的牡丹花，牡丹花意味著富貴和幸福，散發台灣各地的美。 現在就跟著台灣旅遊導覽網一起一探究竟吧！';

export const metadata: Metadata = {
  description: DESCRIPTION,
  icons: {
    shortcut: '/favicon.ico',
  },
  manifest: '/manifest.json',
  metadataBase: process.env.NEXT_PUBLIC_VERCEL_URL
    ? new URL(`https://${process.env.NEXT_PUBLIC_VERCEL_URL}`)
    : undefined,
  openGraph: {
    description: DESCRIPTION,
    images: ['/static/fallback.jpg'],
    siteName: '台灣旅遊導覽網',
    title: '台灣旅遊導覽網',
    type: 'website',
  },
  title: '台灣旅遊導覽網',
  twitter: {
    card: 'summary',
  },
};

const RootLayout = ({ children }: { children: ReactNode }) => (
  <html className={notoSansTC.variable} lang="zh-Hant" suppressHydrationWarning>
    <body>
      <Providers>{children}</Providers>
    </body>
  </html>
);

export default RootLayout;
