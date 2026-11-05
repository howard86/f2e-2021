import { Box, Icon, SimpleGrid, Text } from '@chakra-ui/react';
import { RouteLink } from '@f2e/ui/links';
import Image, { type StaticImageData } from 'next/image';
import { FiCalendar } from 'react-icons/fi';

import type { Category } from '@/constants/categories';
import bed from '@/static/card/bed.png';
import bus from '@/static/card/bus.png';
import food from '@/static/card/food.png';
import spot from '@/static/card/spot.png';

interface QuickLink {
  category: Category;
  href: string;
  icon?: StaticImageData;
  label: string;
}

const LINKS: QuickLink[] = [
  { category: 'scenes', href: '/scenes', icon: spot, label: '景點' },
  { category: 'restaurants', href: '/restaurants', icon: food, label: '美食' },
  { category: 'hotels', href: '/hotels', icon: bed, label: '住宿' },
  { category: 'activities', href: '/events', label: '活動' },
  { category: 'transports', href: '/transports', icon: bus, label: '交通' },
];

const QuickLinks = () => (
  <SimpleGrid
    aria-label="快速入口"
    as="nav"
    columns={{ base: 2, md: 5 }}
    gap="3"
  >
    {LINKS.map((link) => (
      <RouteLink
        _hover={{
          bg: 'colorPalette.subtle',
          borderColor: 'colorPalette.solid',
        }}
        alignItems="center"
        bg="bg"
        borderColor="border"
        borderWidth="1px"
        colorPalette={link.category}
        display="flex"
        gap="3"
        href={link.href}
        key={link.href}
        px="4"
        py="3"
        rounded="lg"
        textDecoration="none"
      >
        {link.icon ? (
          <Image
            alt=""
            height={40}
            src={link.icon}
            style={{ height: 40, objectFit: 'contain', width: 40 }}
            width={40}
          />
        ) : (
          <Box color="colorPalette.fg">
            <Icon boxSize="8">
              <FiCalendar />
            </Icon>
          </Box>
        )}
        <Text fontWeight="semibold" textStyle="body">
          {link.label}
        </Text>
      </RouteLink>
    ))}
  </SimpleGrid>
);

export default QuickLinks;
