import { useAppToast } from '@f2e/ui/toast';
import { useCallback, useRef } from 'react';
import { ZoomLevel } from '@/components/bus-stop-drawer';
import { useMap } from '@/components/map-context-provider';

const useGetLocation = () => {
  const toast = useAppToast();
  const { mapContextRef } = useMap();
  const currentPositionRef = useRef<{ lat: number; lng: number } | null>(null);

  const onLocate = useCallback(async () => {
    if (!window.navigator) {
      toast({ description: '偵測定位系統失敗', status: 'error' });
      return;
    }

    try {
      const geoLocation = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          window.navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 5000,
          });
        },
      );

      toast({ description: '成功獲取定位' });

      console.warn(geoLocation);

      const newPosition = {
        center: [
          geoLocation.coords.longitude,
          geoLocation.coords.latitude,
        ] as mapboxgl.LngLatLike,
        zoom: ZoomLevel.Stops,
      };

      const flyToCurrent = () => {
        mapContextRef.current.map.flyTo({
          center: newPosition.center,
          zoom: ZoomLevel.Stops,
        });
      };

      currentPositionRef.current = {
        lat: geoLocation.coords.latitude,
        lng: geoLocation.coords.longitude,
      };

      const { createMarker, createMarkerElement } = await import(
        '@/services/mapbox'
      );

      if (mapContextRef.current.map && mapContextRef.current.positionMarker) {
        flyToCurrent();
        mapContextRef.current.positionMarker.remove();
      }

      mapContextRef.current.positionMarker = createMarker(
        createMarkerElement({
          id: 'current',
          onClick: flyToCurrent,
          style: {
            backgroundImage: 'url(/current.png)',
            height: '40px',
            width: '40px',
            zIndex: 'var(--chakra-z-index-modal)',
          },
        }),
        newPosition.center,
      );

      if (mapContextRef.current.map) {
        mapContextRef.current.positionMarker.addTo(mapContextRef.current.map);
        flyToCurrent();
      }
    } catch (error) {
      const { code } = error as GeolocationPositionError;
      console.error(error);

      let description: string;
      switch (code) {
        case GeolocationPositionError.PERMISSION_DENIED:
          description = '授權定位失敗';
          break;

        case GeolocationPositionError.POSITION_UNAVAILABLE:
          description = '該地區無定位服務';
          break;

        case GeolocationPositionError.TIMEOUT:
          description = '獲取地址過久，連線中斷';
          break;

        default:
          description = '未知錯誤';
          break;
      }
      toast({ description, status: 'error' });
    }
  }, [mapContextRef, toast]);

  return { currentPositionRef, onLocate };
};

export default useGetLocation;
