'use client';

import { Button, Center, Heading, Text, VStack } from '@chakra-ui/react';
import NextLink from 'next/link';
import Layout from '@/components/layout/layout';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

const ErrorPage = ({ reset }: ErrorPageProps) => (
  <Layout colorPalette="scenes">
    <Center minH="60vh" px="4" py="16">
      <VStack gap="4" textAlign="center">
        <Heading as="h1" textStyle="title-lg">
          發生錯誤
        </Heading>
        <Text color="fg.muted" textStyle="body">
          很抱歉，頁面發生問題，請稍後再試。
        </Text>
        <VStack gap={2}>
          <Button colorPalette="scenes" onClick={reset}>
            重試
          </Button>
          <Button asChild colorPalette="scenes" variant="ghost">
            <NextLink href="/">回首頁</NextLink>
          </Button>
        </VStack>
      </VStack>
    </Center>
  </Layout>
);

export default ErrorPage;
