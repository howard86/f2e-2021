import 'mapbox-gl/dist/mapbox-gl.css';

import type { Metadata, Viewport } from 'next';
import { Noto_Sans_TC } from 'next/font/google';
import type { ReactNode } from 'react';

import { OPEN_GRAPH_BASE, SITE_NAME } from '@/constants/seo';
import Providers from './providers';

const notoSansTC = Noto_Sans_TC({
  display: 'swap',
  variable: '--font-body',
  weight: ['400', '500', '700'],
});

const DESCRIPTION = '查詢全台公車路線、即時到站與附近站牌，輕鬆掌握公車動態。';
const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;

export const metadata: Metadata = {
  description: DESCRIPTION,
  icons: {
    apple: [{ sizes: '180x180', url: '/apple-touch-icon.png' }],
    icon: [
      { sizes: '32x32', type: 'image/png', url: '/favicon-32x32.png' },
      { sizes: '16x16', type: 'image/png', url: '/favicon-16x16.png' },
    ],
  },
  manifest: '/site.webmanifest',
  metadataBase: new URL(
    productionHost ? `https://${productionHost}` : 'http://localhost:3000',
  ),
  openGraph: {
    ...OPEN_GRAPH_BASE,
    description: DESCRIPTION,
    title: SITE_NAME,
  },
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  twitter: { card: 'summary_large_image' },
};

export const viewport: Viewport = {
  themeColor: '#60517B',
};

const RootLayout = ({ children }: { children: ReactNode }) => (
  <html className={notoSansTC.variable} lang="zh-Hant" suppressHydrationWarning>
    <body>
      <Providers>{children}</Providers>
    </body>
  </html>
);

export default RootLayout;
