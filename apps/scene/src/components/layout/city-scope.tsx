'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

import { CITY_SCOPED_PATHS } from '@/constants/preferences';
import usePreferredCity from '@/hooks/use-preferred-city';

/**
 * Adds the preferred city to a list page that opened without one, so lists
 * stay grouped by city. Runs in the browser only; `?city=all` opts out.
 */
const CityScope = () => {
  const { city } = usePreferredCity();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (
      !city ||
      searchParams.has('city') ||
      !CITY_SCOPED_PATHS.includes(pathname)
    ) {
      return;
    }

    const next = new URLSearchParams(searchParams);
    next.set('city', city);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }, [city, pathname, router, searchParams]);

  return null;
};

export default CityScope;
