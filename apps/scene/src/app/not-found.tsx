import { Button, Center, Heading, Text, VStack } from '@chakra-ui/react';
import NextLink from 'next/link';
import Layout from '@/components/layout/layout';

const NotFound = () => (
  <Layout colorPalette="scenes">
    <Center minH="60vh" pt="24">
      <VStack gap={4} textAlign="center">
        <Heading as="h1" color="fg">
          找不到頁面
        </Heading>
        <Text color="fg.muted">您要找的頁面不存在或已被移除。</Text>
        <Button asChild colorPalette="scenes">
          <NextLink href="/">回首頁</NextLink>
        </Button>
      </VStack>
    </Center>
  </Layout>
);

export default NotFound;
