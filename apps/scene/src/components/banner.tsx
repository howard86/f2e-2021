import { Button, Flex, type FlexProps, Text } from '@chakra-ui/react';
import NextLink from 'next/link';

interface BannerProps extends FlexProps {
  hideButton?: boolean;
  href: string;
  mainColor: FlexProps['color'];
  title: string;
}

// TODO: refactor usage of hideButton
const Banner = ({
  title,
  href,
  mainColor,
  hideButton,
  ...props
}: BannerProps) => (
  <Flex
    align="center"
    bg={mainColor}
    justify="space-between"
    my="10"
    px={[6, 8, 12]}
    py="2"
    {...props}
  >
    <Text as="h2" color="white" textStyle="headline-2">
      {title}
    </Text>
    {!hideButton && (
      <Button
        _hover={{ bg: 'white', color: mainColor }}
        asChild
        borderWidth="3px"
        color="white"
        rounded="xl"
        variant="outline"
      >
        <NextLink href={href}>查看更多</NextLink>
      </Button>
    )}
  </Flex>
);

export default Banner;
