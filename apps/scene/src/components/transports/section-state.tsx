import { Box, Skeleton, Stack, Text } from '@chakra-ui/react';
import type { ReactNode } from 'react';

import SectionHeading from '@/components/ui/section-heading';

export const SectionSkeleton = () => (
  <Stack gap="3">
    <Skeleton h="6" w="40" />
    <Skeleton h="20" />
  </Stack>
);

export const Unavailable = () => (
  <Text
    bg="bg.subtle"
    borderColor="border"
    borderWidth="1px"
    color="fg.muted"
    p="5"
    rounded="lg"
    textStyle="body-sm"
  >
    暫時無法取得資料，稍後再試
  </Text>
);

interface TransportSectionProps {
  action?: { href: string; label: string };
  children: ReactNode;
  title: string;
}

export const TransportSection = ({
  action,
  children,
  title,
}: TransportSectionProps) => (
  <Box as="section">
    <SectionHeading action={action} title={title} />
    {children}
  </Box>
);
