import type { MetadataRoute } from 'next';

const robots = (): MetadataRoute.Robots => {
  const { VERCEL_ENV } = process.env;

  if (VERCEL_ENV && VERCEL_ENV !== 'production') {
    return { rules: { disallow: '/', userAgent: '*' } };
  }

  return { rules: { allow: '/', disallow: '/api/', userAgent: '*' } };
};

export default robots;
