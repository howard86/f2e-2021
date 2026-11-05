import { Button, EmptyState, VStack } from '@chakra-ui/react';
import { FiAlertCircle, FiSearch } from 'react-icons/fi';

export const EmptyResult = ({ keyword }: { keyword: string }) => (
  <EmptyState.Root py="16">
    <EmptyState.Content>
      <EmptyState.Indicator>
        <FiSearch />
      </EmptyState.Indicator>
      <VStack textAlign="center">
        <EmptyState.Title>查無「{keyword}」的結果</EmptyState.Title>
        <EmptyState.Description>請試試其他關鍵字</EmptyState.Description>
      </VStack>
    </EmptyState.Content>
  </EmptyState.Root>
);

export const ErrorResult = ({ onRetry }: { onRetry: () => void }) => (
  <EmptyState.Root py="16">
    <EmptyState.Content>
      <EmptyState.Indicator>
        <FiAlertCircle />
      </EmptyState.Indicator>
      <VStack textAlign="center">
        <EmptyState.Title>搜尋失敗</EmptyState.Title>
        <EmptyState.Description>請稍後再試一次</EmptyState.Description>
      </VStack>
      <Button colorPalette="gray" onClick={onRetry} variant="outline">
        重試
      </Button>
    </EmptyState.Content>
  </EmptyState.Root>
);
