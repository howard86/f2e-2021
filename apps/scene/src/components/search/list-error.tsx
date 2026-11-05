'use client';

import { Button, Container, Stack, Text } from '@chakra-ui/react';

import Layout from '@/components/layout/layout';

export interface ListErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Error boundary shared by the cached list routes. They throw when TDX
 * fails so a degraded page is never stored by the CDN.
 */
const ListError = ({ reset }: ListErrorProps) => (
  <Layout colorPalette="scenes">
    <Container maxW="6xl" py={{ base: 16, md: 24 }}>
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
        <Text textStyle="title-sm">資料暫時無法載入</Text>
        <Text color="fg.muted" textStyle="body">
          觀光資料來源暫時忙碌，請稍候一分鐘再試。
        </Text>
        <Button mt="2" onClick={reset} size="sm">
          重新載入
        </Button>
      </Stack>
    </Container>
  </Layout>
);

export default ListError;
