import { Box, Flex, Heading, Text } from '@chakra-ui/react';
import { RouteLink } from '@f2e/ui/links';

interface SectionHeadingProps {
  action?: { href: string; label: string };
  /** Small coloured label above the title, in colorPalette.fg. */
  eyebrow?: string;
  /** Heading level; defaults to h2. */
  level?: 'h1' | 'h2' | 'h3';
  title: string;
}

const SectionHeading = ({
  action,
  eyebrow,
  level = 'h2',
  title,
}: SectionHeadingProps) => (
  <Flex align="flex-end" gap="4" justify="space-between" mb="6">
    <Box>
      {eyebrow ? (
        <Text
          color="colorPalette.fg"
          fontWeight="bold"
          letterSpacing="0.08em"
          mb="1"
          textStyle="body-sm"
        >
          {eyebrow}
        </Text>
      ) : null}
      <Heading as={level} textStyle="title-md">
        {title}
      </Heading>
    </Box>
    {action ? (
      <RouteLink
        color="colorPalette.fg"
        flexShrink={0}
        fontWeight="medium"
        href={action.href}
        textStyle="body-sm"
      >
        {action.label} →
      </RouteLink>
    ) : null}
  </Flex>
);

export default SectionHeading;
