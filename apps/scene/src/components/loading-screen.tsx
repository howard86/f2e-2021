import { Center, type CenterProps, Spinner } from '@chakra-ui/react';

const LoadingScreen = (props: CenterProps) => (
  <Center h="full" w="full" {...props}>
    <Spinner
      animationDuration="0.66s"
      borderBottomColor="gray.200"
      borderInlineStartColor="gray.200"
      borderWidth="4px"
      color="colorPalette.solid"
      size="xl"
    />
  </Center>
);

export default LoadingScreen;
