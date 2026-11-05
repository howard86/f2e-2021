import { Button, Flex, type FlexProps, Text } from '@chakra-ui/react';
import NextLink from 'next/link';
import type { ReactNode } from 'react';

interface SectionBannerProps extends FlexProps {
  action?: ReactNode;
  title: string;
}

const SectionBanner = ({ title, action, ...props }: SectionBannerProps) => (
  <Flex
    align="center"
    bg="colorPalette.solid"
    justify="space-between"
    my="10"
    px={[6, 8, 12]}
    py="2"
    {...props}
  >
    <Text as="h2" color="white" textStyle="headline-2">
      {title}
    </Text>
    {action}
  </Flex>
);

interface SectionBannerLinkProps {
  children: ReactNode;
  href: string;
}

export const SectionBannerLink = ({
  href,
  children,
}: SectionBannerLinkProps) => (
  <Button
    _hover={{ bg: 'white', color: 'colorPalette.solid' }}
    asChild
    borderWidth="3px"
    color="white"
    rounded="xl"
    variant="outline"
  >
    <NextLink href={href}>{children}</NextLink>
  </Button>
);

export default SectionBanner;
