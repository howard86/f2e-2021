'use client';

import type { LinkProps } from '@chakra-ui/react';
import { RouteLink } from '@f2e/ui/links';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

interface NavLinkProps extends LinkProps {
  children: ReactNode;
  href: string;
}

/** Nav link that marks the current section with aria-current. */
const NavLink = ({ href, children, ...props }: NavLinkProps) => {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <RouteLink
      _hover={{ bg: 'bg.muted', textDecoration: 'none' }}
      aria-current={isActive ? 'page' : undefined}
      bg={isActive ? 'colorPalette.subtle' : undefined}
      color={isActive ? 'colorPalette.fg' : 'fg.muted'}
      fontWeight={isActive ? 'bold' : 'medium'}
      href={href}
      px="3"
      py="1.5"
      rounded="full"
      {...props}
    >
      {children}
    </RouteLink>
  );
};

export default NavLink;
