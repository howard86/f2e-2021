import { Stack, Text } from '@chakra-ui/react';
import { RouteLink } from '@f2e/ui/links';

interface EmptyStateProps {
  action?: { href: string; label: string };
  description?: string;
  title: string;
}

const EmptyState = ({ action, description, title }: EmptyStateProps) => (
  <Stack
    align="center"
    bg="bg.subtle"
    borderColor="border"
    borderStyle="dashed"
    borderWidth="1px"
    gap="2"
    py="14"
    rounded="lg"
    textAlign="center"
  >
    <Text textStyle="title-sm">{title}</Text>
    {description ? (
      <Text color="fg.muted" textStyle="body">
        {description}
      </Text>
    ) : null}
    {action ? (
      <RouteLink color="colorPalette.fg" href={action.href} mt="2">
        {action.label}
      </RouteLink>
    ) : null}
  </Stack>
);

export default EmptyState;
