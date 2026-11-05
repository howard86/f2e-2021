'use client';

import { Box, Button } from '@chakra-ui/react';
import { type ReactNode, useCallback, useId, useState } from 'react';

/** Folds tall content visually; the full text stays in the DOM. */
const Collapsible = ({
  children,
  collapsible,
}: {
  children: ReactNode;
  collapsible: boolean;
}) => {
  const id = useId();
  const [open, setOpen] = useState(false);
  const folded = collapsible && !open;
  const onClick = useCallback(() => setOpen((value) => !value), []);

  return (
    <Box>
      <Box
        _after={
          folded
            ? {
                bgGradient: 'to-t',
                bottom: 0,
                content: '""',
                gradientFrom: 'bg',
                gradientTo: 'transparent',
                h: '16',
                left: 0,
                position: 'absolute',
                right: 0,
              }
            : undefined
        }
        id={id}
        maxH={folded ? '14rem' : undefined}
        overflow="hidden"
        position="relative"
      >
        {children}
      </Box>
      {collapsible ? (
        <Button
          aria-controls={id}
          aria-expanded={open}
          colorPalette="gray"
          mt="2"
          onClick={onClick}
          size="sm"
          variant="ghost"
        >
          {open ? '收合' : '展開全文'}
        </Button>
      ) : null}
    </Box>
  );
};

export default Collapsible;
