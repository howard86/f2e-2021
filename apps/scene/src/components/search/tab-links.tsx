import { Flex } from '@chakra-ui/react';
import { RouteLink } from '@f2e/ui/links';

export interface TabLink {
  href: string;
  label: string;
}

interface TabLinksProps {
  activeHref: string;
  /** Accessible name of the tab group. */
  label: string;
  tabs: TabLink[];
}

/** Server-rendered tabs: each one is a link, the URL holds the selection. */
const TabLinks = ({ activeHref, label, tabs }: TabLinksProps) => (
  <Flex
    aria-label={label}
    as="nav"
    borderBottomWidth="1px"
    borderColor="border"
    gap="1"
    overflowX="auto"
  >
    {tabs.map((tab) => {
      const active = tab.href === activeHref;

      return (
        <RouteLink
          aria-current={active ? 'page' : undefined}
          borderBottomColor={active ? 'colorPalette.solid' : 'transparent'}
          borderBottomWidth="2px"
          color={active ? 'colorPalette.fg' : 'fg.muted'}
          fontWeight={active ? 'semibold' : 'normal'}
          href={tab.href}
          key={tab.href}
          mb="-1px"
          px="4"
          py="2"
          textDecoration="none"
          whiteSpace="nowrap"
        >
          {tab.label}
        </RouteLink>
      );
    })}
  </Flex>
);

export default TabLinks;
