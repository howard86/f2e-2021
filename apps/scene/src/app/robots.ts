import type { MetadataRoute } from 'next';

import { SITE_URL } from '@/lib/seo';

const isPreview =
  Boolean(process.env.VERCEL_ENV) && process.env.VERCEL_ENV !== 'production';

const robots = (): MetadataRoute.Robots => ({
  rules: {
    allow: isPreview ? undefined : '/',
    disallow: isPreview ? '/' : ['/api/', '/search', '/saved'],
    userAgent: '*',
  },
  sitemap: new URL('/sitemap.xml', SITE_URL).href,
});

export default robots;
