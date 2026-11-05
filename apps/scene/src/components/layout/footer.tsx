'use client';

import {
  Box,
  type BoxProps,
  Center,
  Flex,
  IconButton,
  Text,
} from '@chakra-ui/react';
import { BsChevronUp } from 'react-icons/bs';

import Logo from '../icons/logo';

const Footer = (props: BoxProps) => {
  const onClick = () => {
    window.scrollTo(0, 0);
  };

  return (
    <Box as="footer" {...props}>
      <Box
        bgGradient="to-t"
        gradientFrom="colorPalette.muted"
        gradientTo="white"
        pb={[20, 36]}
        pt={[12, 20]}
        px="8"
      >
        <Center display={['flex', 'flex', 'none']} textAlign="center">
          <IconButton
            _hover={{
              bgColor: 'colorPalette.muted',
            }}
            aria-label="scroll to top"
            bgColor="colorPalette.solid"
            color="white"
            fontSize="2xl"
            onClick={onClick}
            p="3"
            rounded="full"
            size="lg"
          >
            <BsChevronUp />
          </IconButton>
        </Center>
      </Box>
      <Flex
        align="center"
        bg="colorPalette.solid"
        color="white"
        flexDir={['column', 'column', 'row']}
        fontWeight="medium"
        px={[12, 12, 4]}
        py="4"
      >
        <Logo boxSize={['192px', '252px', '128px']} ml="8" mr="4" />
        <Box>
          <Flex flexDir={['column', 'column', 'row']} my="2">
            <Text>24小時免付費旅遊諮詢熱線：</Text>
            <Text>0800-011765</Text>
          </Flex>
          <Flex flexDir={['column', 'column', 'row']} my="2">
            <Text>免付費國旅券專線：</Text>
            <Text>0800-211734</Text>
          </Flex>
          <Flex flexDir={['column', 'column', 'row']} my="2">
            <Text>服務時間：</Text>
            <Text>週一至週日8:30~18:30</Text>
          </Flex>
        </Box>
      </Flex>
    </Box>
  );
};

export default Footer;
