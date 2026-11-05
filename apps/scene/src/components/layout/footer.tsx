import { Box, Container, Flex, Link, Stack, Text } from '@chakra-ui/react';
import { RouteLink } from '@f2e/ui/links';
import { FiArrowUp } from 'react-icons/fi';
import ROUTES from '@/constants/routes';

import LogoMark from '../icons/logo-mark';

const Footer = () => (
  <Box as="footer" bg="bg.subtle" borderTopWidth="1px" mt="16" py="10">
    <Container maxW="6xl" px={{ base: 4, md: 6 }}>
      <Flex
        direction={{ base: 'column', md: 'row' }}
        gap="8"
        justify="space-between"
      >
        <Stack gap="3" maxW="md">
          <Flex align="center" gap="2">
            <LogoMark h="8" />
            <Text fontWeight="bold">台灣旅遊導覽網</Text>
          </Flex>
          <Text color="fg.muted" textStyle="body-sm">
            景點、美食、住宿與活動資料來源：TDX
            運輸資料流通服務、交通部觀光署；天氣資料來源：中央氣象署。
          </Text>
        </Stack>
        <Stack aria-label="頁尾導覽" as="nav" gap="2">
          <Text color="fg.muted" fontWeight="bold" textStyle="body-sm">
            探索
          </Text>
          <Flex gap={{ base: 3, md: 4 }} wrap="wrap">
            {ROUTES.map((route) => (
              <RouteLink
                _hover={{ color: 'colorPalette.fg' }}
                href={route.href}
                key={route.href}
                textStyle="body-sm"
              >
                {route.label}
              </RouteLink>
            ))}
          </Flex>
        </Stack>
      </Flex>
      <Flex
        align={{ base: 'flex-start', md: 'center' }}
        borderTopWidth="1px"
        direction={{ base: 'column', md: 'row' }}
        gap="3"
        justify="space-between"
        mt="8"
        pt="6"
      >
        <Text color="fg.muted" textStyle="body-sm">
          24 小時免付費旅遊諮詢熱線 0800-011765　免付費國旅券專線
          0800-211734（週一至週日 8:30–18:30）
        </Text>
        <Link color="colorPalette.fg" href="#top" textStyle="body-sm">
          <FiArrowUp />
          回到頁首
        </Link>
      </Flex>
    </Container>
  </Box>
);

export default Footer;
