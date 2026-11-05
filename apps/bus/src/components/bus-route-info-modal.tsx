import {
  Box,
  Dialog,
  Heading,
  IconButton,
  NativeSelect,
  Portal,
  Spinner,
  Text,
  useBreakpointValue,
  VStack,
} from '@chakra-ui/react';
import type { BusRoute } from '@f2e/tdx-bus';
import type { City } from '@f2e/tdx-core';
import { ExternalLink } from '@f2e/ui/links';
import { type ChangeEvent, useState } from 'react';
import { MdClose } from 'react-icons/md';
import { useGetBusRoutes } from '@/services/local';
import { getBusRouteDestinations, getSubRouteTime } from '@/utils/bus';

interface BusRouteInfoModalProps
  extends Omit<Dialog.RootProps, 'children' | 'onOpenChange' | 'open'> {
  city: City;
  isOpen: boolean;
  onClose: VoidFunction;
  routeName: string;
  routeUid: string;
}

interface BusRouteInfoBodyProps {
  route: BusRoute;
}

const BusRouteInfoBody = ({ route }: BusRouteInfoBodyProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedIndex(Number.parseInt(event.target.value, 10));
  };

  return (
    <>
      <Heading fontSize="lg" p="4">
        {getBusRouteDestinations(route)}
      </Heading>
      {Boolean(route.HasSubRoutes) && (
        <NativeSelect.Root>
          <NativeSelect.Field
            onChange={onSelect}
            textAlign="center"
            value={selectedIndex}
          >
            {route.SubRoutes.map((subRoute, index) => (
              <option key={subRoute.SubRouteUID} value={index}>
                {subRoute.Headsign ||
                  subRoute.SubRouteName.Zh_tw.replace(
                    route.RouteName.Zh_tw,
                    '',
                  )}
              </option>
            ))}
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
      )}
      {Boolean(route.HasSubRoutes) && (
        <>
          <Text fontSize="2xl" my="4">
            運行時間
          </Text>
          <Text>
            平日：
            {getSubRouteTime(
              route.SubRoutes[selectedIndex].FirstBusTime,
              route.SubRoutes[selectedIndex].LastBusTime,
            )}
          </Text>
          <Text>
            假日：
            {getSubRouteTime(
              route.SubRoutes[selectedIndex].HolidayFirstBusTime,
              route.SubRoutes[selectedIndex].HolidayLastBusTime,
            )}
          </Text>
        </>
      )}

      <Box flexGrow={1} />
      <Text>{route.TicketPriceDescriptionZh}</Text>
      <Text>{route.FareBufferZoneDescriptionZh}</Text>
      <VStack my="2">
        {route.Operators.map((operator) => (
          <Text key={operator.OperatorID}>
            {/* TODO: add operator details */}
            {operator.OperatorName.Zh_tw}
          </Text>
        ))}
      </VStack>
      <ExternalLink
        color="secondary.200"
        fontWeight="bold"
        href={route.RouteMapImageUrl}
      >
        詳細站牌資訊
      </ExternalLink>
    </>
  );
};

const BusRouteInfoModal = ({
  city,
  isOpen,
  onClose,
  routeName,
  routeUid,
  ...props
}: BusRouteInfoModalProps) => {
  const size = useBreakpointValue<Dialog.RootProps['size']>({
    base: 'full',
    md: 'md',
  });
  const motionPreset = useBreakpointValue<Dialog.RootProps['motionPreset']>({
    base: 'slide-in-right',
    md: 'slide-in-bottom',
  });
  const { data, error, isLoading } = useGetBusRoutes(
    isOpen ? { city, route: routeName } : null,
  );
  const routes = data?.data;
  const route =
    routes?.find(
      (item) =>
        item.RouteName.Zh_tw === routeName && item.RouteUID === routeUid,
    ) ??
    routes?.find((item) => item.RouteName.Zh_tw === routeName) ??
    routes?.[0];

  return (
    <Dialog.Root
      motionPreset={motionPreset}
      // biome-ignore lint/performance/noJsxPropsBind: callback needs local render state or the current event target.
      onOpenChange={({ open }) => {
        if (!open) {
          onClose();
        }
      }}
      open={isOpen}
      placement="center"
      scrollBehavior="inside"
      size={size}
      {...props}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header bg="primary.400" textAlign="center">
              <Dialog.Title>{routeName}</Dialog.Title>
            </Dialog.Header>
            <Dialog.CloseTrigger asChild>
              <IconButton
                aria-label="close modal"
                bgColor="primary.50"
                color="primary.600"
                fontSize="xl"
                pos="absolute"
                right="4"
                rounded="full"
                size="xs"
                top="5"
              >
                <MdClose />
              </IconButton>
            </Dialog.CloseTrigger>
            <Dialog.Body
              bgGradient="background"
              display="flex"
              flexDir="column"
              pb="8"
              textAlign="center"
            >
              {route ? (
                <BusRouteInfoBody route={route} />
              ) : (
                <>
                  {isLoading ? <Spinner mx="auto" my="8" /> : null}
                  {error ? (
                    <Text my="8">無法載入路線資訊，請稍後再試</Text>
                  ) : null}
                </>
              )}
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default BusRouteInfoModal;
