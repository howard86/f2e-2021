import {
  Box,
  Button,
  Drawer,
  HStack,
  IconButton,
  Portal,
  Tag,
  Text,
} from '@chakra-ui/react';
import type { BusEstimation, BusStopOfRoute } from '@f2e/tdx-bus';
import { NextImage as Image } from '@f2e/ui/next-image';
import type { Dispatch, SetStateAction } from 'react';
import { BiChevronLeft, BiChevronRight } from 'react-icons/bi';
import { MdClose } from 'react-icons/md';
import background from '@/background-small.png';
import bus from '@/bus.png';
import { useMap } from '@/components/map-context-provider';
import { getLastElement } from '@/utils/array';
import { getBusEstimationStatus } from '@/utils/bus';

interface BusStopDrawerProps
  extends Omit<Drawer.RootProps, 'children' | 'onOpenChange' | 'open'> {
  busEstimation: BusEstimation;
  destinationName: string;
  isOpen: boolean;
  onClose: VoidFunction;
  selectedBusStop: BusStopOfRoute;
  selectedStopId: string;
  setSelectedStopId: Dispatch<SetStateAction<string>>;
}

export const ZoomLevel = {
  City: 12,
  Marker: 13.5,
  Stop: 16,
  Stops: 15,
} as const;

const BusStopDrawer = ({
  isOpen,
  onClose,
  destinationName,
  selectedStopId,
  setSelectedStopId,
  busEstimation,
  selectedBusStop,
  ...props
}: BusStopDrawerProps) => {
  const { mapContextRef } = useMap();
  const handleRouteStopClick = async (step: 1 | -1) => {
    const currentStops = selectedBusStop.Stops;

    const previousStop =
      currentStops[
        currentStops.findIndex((stop) => stop.StopUID === selectedStopId) + step
      ];

    setSelectedStopId(previousStop.StopUID);

    const { getPosition } = await import('@/services/mapbox');
    mapContextRef.current.map.flyTo(
      getPosition(
        previousStop.StopPosition.PositionLat,
        previousStop.StopPosition.PositionLon,
        ZoomLevel.Stop,
      ),
    );
  };

  const onPreviousStopClick = async () => {
    await handleRouteStopClick(-1);
  };

  const onNextStopClick = async () => {
    await handleRouteStopClick(1);
  };

  return (
    <Drawer.Root
      // biome-ignore lint/performance/noJsxPropsBind: callback needs local render state or the current event target.
      onOpenChange={({ open }) => {
        if (!open) {
          onClose();
        }
      }}
      open={isOpen}
      placement="bottom"
      size="lg"
      {...props}
    >
      <Portal>
        <Drawer.Positioner>
          <Drawer.Content minH="200px" textAlign="center">
            <Box
              bgGradient="background"
              h="full"
              overflow="hidden"
              pos="fixed"
              w="full"
              zIndex="1"
            >
              <Image
                alt="background"
                layout="fill"
                objectFit="cover"
                objectPosition="bottom"
                placeholder="blur"
                src={background}
              />
            </Box>
            <Drawer.Header pb="0" zIndex="docked">
              <Drawer.Title lineClamp={1}>
                {busEstimation.StopName.Zh_tw}
              </Drawer.Title>
            </Drawer.Header>
            <Drawer.CloseTrigger asChild>
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
                zIndex="docked"
              >
                <MdClose />
              </IconButton>
            </Drawer.CloseTrigger>
            <Drawer.Body display="flex" flexDir="column" pt="0" zIndex="docked">
              <Text color="primary.200" lineClamp={1}>
                往{destinationName}
              </Text>
              <HStack mx="auto" my="2">
                <Button
                  disabled={selectedBusStop.Stops[0].StopUID === selectedStopId}
                  onClick={onPreviousStopClick}
                  size="sm"
                  variant="ghost"
                >
                  <BiChevronLeft />
                  上一站
                </Button>
                <Tag.Root colorPalette="secondary" ml="2">
                  <Tag.Label>{getBusEstimationStatus(busEstimation)}</Tag.Label>
                </Tag.Root>
                <Button
                  disabled={
                    getLastElement(selectedBusStop.Stops).StopUID ===
                    selectedStopId
                  }
                  onClick={onNextStopClick}
                  size="sm"
                  variant="ghost"
                >
                  下一站
                  <BiChevronRight />
                </Button>
              </HStack>
              <Box bottom="1" left="0" pos="absolute" right="0">
                <Image
                  alt="bus"
                  height={60}
                  objectFit="contain"
                  placeholder="blur"
                  src={bus}
                  width={200}
                />
              </Box>
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
};

export default BusStopDrawer;
