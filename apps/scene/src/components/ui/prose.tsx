import type { BoxProps } from '@chakra-ui/react';
import { Box } from '@chakra-ui/react';

/** Long-form reading text: ~68ch measure, 16-17px, relaxed line-height. */
const Prose = (props: BoxProps) => (
  <Box
    css={{
      '& > * + *': { marginTop: '1em' },
      '& a': {
        color: 'colorPalette.fg',
        textDecoration: 'underline',
        textUnderlineOffset: '3px',
      },
    }}
    maxW="68ch"
    textStyle="prose"
    whiteSpace="pre-line"
    {...props}
  />
);

export default Prose;
