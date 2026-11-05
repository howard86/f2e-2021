'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

import usePreferredCity from '@/hooks/use-preferred-city';
import { scopedHref } from '@/lib/scoped-href';

/**
 * Sends a list page that opened without a city to the preferred city's path,
 * so lists stay grouped by city. Runs in the browser only (the list pages are
 * CDN-cached and cannot read the preference); a path naming a city or `all`
 * is never rewritten. The query is read from `window.location` because
 * useSearchParams would force every static page to a Suspense boundary.
 */
const CityScope = () => {
  const { city } = usePreferredCity();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!city) {
      return;
    }

    const target = scopedHref(pathname, window.location.search, city);

    if (target) {
      router.replace(target, { scroll: false });
    }
  }, [city, pathname, router]);

  return null;
};

export default CityScope;
