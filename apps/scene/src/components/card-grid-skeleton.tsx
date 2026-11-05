import { SimpleGrid, type SimpleGridProps, Skeleton } from '@chakra-ui/react';

interface CardGridSkeletonProps extends SimpleGridProps {
  count?: number;
}

const CardGridSkeleton = ({ count = 6, ...props }: CardGridSkeletonProps) => (
  <SimpleGrid columns={[1, 2, 3]} gap={6} {...props}>
    {Array.from({ length: count }, (_, index) => (
      <Skeleton
        h={['380px', '420px', '420px', '500px']}
        key={`skeleton-${index.toString()}`}
        rounded="2xl"
      />
    ))}
  </SimpleGrid>
);

export default CardGridSkeleton;
