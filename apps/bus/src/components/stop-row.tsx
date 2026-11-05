import { Box, Circle, Flex, Tag, Text, VStack } from '@chakra-ui/react';
import { memo } from 'react';
import type { SlimStop } from '@/utils/slim-route';
import { getTwoDigitString } from '@/utils/string';

interface StopRowProps {
  onSelect: (stop: SlimStop) => void;
  status: string;
  stop: SlimStop;
}

const StopRow = memo(({ stop, status, onSelect }: StopRowProps) => {
  const isComing = status === '進站中';

  const onClick = () => {
    onSelect(stop);
  };

  return (
    <Flex align="center" cursor="pointer" onClick={onClick} px="4">
      <Text>{stop.StopName.Zh_tw}</Text>
      <Tag.Root colorPalette="secondary" ml="2">
        <Tag.Label>{status}</Tag.Label>
      </Tag.Root>
      <Box flexGrow={1} />
      <VStack gap={0}>
        <Box borderColor="primary.200" borderLeft="2px" h="20px" />
        <Circle
          bg={isComing ? 'primary.200' : 'transparent'}
          borderColor="primary.200"
          borderWidth="2px"
          boxShadow={
            isComing
              ? '0 0 5px var(--chakra-colors-secondary-200),0 0 10px var(--chakra-colors-secondary-300),0 0 15px var(--chakra-colors-secondary-400)'
              : 'none'
          }
          color={isComing ? 'secondary.700' : 'white'}
          fontSize="9px"
          fontWeight="bold"
          rounded="full"
          size="20px"
        >
          {getTwoDigitString(stop.StopSequence)}
        </Circle>
        <Box borderColor="primary.200" borderLeft="2px" h="20px" />
      </VStack>
    </Flex>
  );
});

StopRow.displayName = 'StopRow';

export default StopRow;
