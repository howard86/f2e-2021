import 'mapbox-gl/dist/mapbox-gl.css';

import type { Metadata, Viewport } from 'next';
import { Noto_Sans_TC } from 'next/font/google';
import type { ReactNode } from 'react';

import Providers from './providers';

const notoSansTC = Noto_Sans_TC({
  display: 'swap',
  variable: '--font-body',
  weight: ['400', '500', '700'],
});

const SITE_NAME = 'Iro Bus';
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
    description: DESCRIPTION,
    images: [{ alt: SITE_NAME, height: 567, url: '/preview.jpg', width: 830 }],
    locale: 'zh_TW',
    siteName: SITE_NAME,
    title: SITE_NAME,
    type: 'website',
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
