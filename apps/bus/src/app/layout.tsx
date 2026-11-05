import 'mapbox-gl/dist/mapbox-gl.css';

import type { Metadata } from 'next';
import { Noto_Sans_TC } from 'next/font/google';
import type { ReactNode } from 'react';

import Providers from './providers';

const notoSansTC = Noto_Sans_TC({
  display: 'swap',
  variable: '--font-body',
  weight: ['400', '500', '700'],
});

const DESCRIPTION =
  '設計理念的取名來自於公車與捷運都會以顏色做為路線的區分，能有助於乘客辨別搭乘路線，節省時間，因而取名為Iro Bus，Iro為日文顏色的意思。Iro Bus整體色系偏暗色，營造科技感，帶給乘客能自由的創新自己的公車路線，穿梭全台各地，輕鬆掌握全台的公車訊息。';

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
    process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : 'http://localhost:3000',
  ),
  openGraph: {
    description:
      '設計理念的取名來自於公車與捷運都會以顏色做為路線的區分，能有助於乘客辨別搭乘路線，節省時間',
    images: ['/preview.jpg'],
    title: 'Iro Bus',
  },
  title: 'Iro Bus',
};

const RootLayout = ({ children }: { children: ReactNode }) => (
  <html className={notoSansTC.variable} lang="zh-Hant" suppressHydrationWarning>
    <body>
      <Providers>{children}</Providers>
    </body>
  </html>
);

export default RootLayout;
