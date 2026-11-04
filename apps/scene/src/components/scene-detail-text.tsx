'use client';

import { Flex, type FlexProps, Icon, Link, Tag } from '@chakra-ui/react';
import type { IconType } from 'react-icons';

interface SceneDetailBoxProps extends FlexProps {
  href?: string;
  icon: IconType;
  info?: string;
  label: string;
}

const SceneDetailBox = ({
  label,
  info,
  href,
  icon,
  ...props
}: SceneDetailBoxProps) => {
  if (!info) {
    return null;
  }

  return (
    <Flex align="center" direction={['column', 'row']} gap={2} {...props}>
      <Tag.Root
        colorPalette="blue"
        flexGrow={0}
        flexShrink={0}
        m="2"
        size="lg"
        variant="outline"
      >
        <Tag.Label>{label}</Tag.Label>
        <Tag.EndElement>
          <Icon as={icon} />
        </Tag.EndElement>
      </Tag.Root>

      {href ? (
        <Link href={href} rel="noreferrer" target="_blank">
          {info}
        </Link>
      ) : (
        info
      )}
    </Flex>
  );
};

export default SceneDetailBox;
