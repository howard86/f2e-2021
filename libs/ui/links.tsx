import { Link, type LinkProps } from '@chakra-ui/react';
import NextLink from 'next/link';
import type { ElementType, ReactNode, RefObject } from 'react';

interface RouteLinkProps extends LinkProps {
  /** Chakra component to render the link with, e.g. LinkOverlay. */
  as?: ElementType;
  children: ReactNode;
  href: string;
  /** Forwarded to next/link; false skips prefetching the target route. */
  prefetch?: boolean | null;
  ref?: RefObject<HTMLAnchorElement | null>;
}

/** Client-side navigation with Chakra link styling. */
export const RouteLink = ({
  as: Component = Link,
  children,
  href,
  prefetch,
  ref,
  ...props
}: RouteLinkProps) => (
  <Component asChild {...props}>
    <NextLink href={href} prefetch={prefetch} ref={ref}>
      {children}
    </NextLink>
  </Component>
);

/** Opens in a new tab without giving the target page a handle back. */
export const ExternalLink = (props: LinkProps) => (
  <Link rel="noopener noreferrer" target="_blank" {...props} />
);
