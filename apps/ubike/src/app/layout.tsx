import 'mapbox-gl/dist/mapbox-gl.css';

import type { Metadata, Viewport } from 'next';
import { Roboto } from 'next/font/google';
import type { ReactNode } from 'react';

import Providers from './providers';

const roboto = Roboto({
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '700'],
});

const TITLE = 'uBike Travel';
const DESCRIPTION =
  '深色版本的uBike Travel，使用者能租借腳踏車及根據地區尋找喜歡的騎乘路線';

const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL;

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
  metadataBase: vercelUrl ? new URL(`https://${vercelUrl}`) : undefined,
  openGraph: {
    description: DESCRIPTION,
    images: ['/logo.png'],
    title: TITLE,
  },
  title: TITLE,
};

export const viewport: Viewport = {
  initialScale: 1,
  width: 'device-width',
};

const RootLayout = ({ children }: { children: ReactNode }) => (
  <html className={roboto.variable} lang="zh-Hant" suppressHydrationWarning>
    <body>
      <Providers>{children}</Providers>
    </body>
  </html>
);

export default RootLayout;
