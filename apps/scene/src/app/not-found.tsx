import { Button, Center, Heading, Text, VStack } from '@chakra-ui/react';
import NextLink from 'next/link';
import Layout from '@/components/layout/layout';

const NotFound = () => (
  <Layout colorPalette="scenes">
    <Center minH="60vh" px="4" py="16">
      <VStack gap="4" textAlign="center">
        <Heading as="h1" textStyle="title-lg">
          找不到頁面
        </Heading>
        <Text color="fg.muted" textStyle="body">
          您要找的頁面不存在或已被移除。
        </Text>
        <Button asChild colorPalette="scenes">
          <NextLink href="/">回首頁</NextLink>
        </Button>
      </VStack>
    </Center>
  </Layout>
);

export default NotFound;
