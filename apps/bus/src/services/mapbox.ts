import mapboxgl from 'mapbox-gl';
import type { GeoJSONLineString } from 'wellknown';

type Coordinate = [number, number];

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

export const getPosition = (
  lat: number,
  lng: number,
  zoom: number,
): Partial<mapboxgl.MapboxOptions> => ({
  center: [lng, lat],
  zoom,
});

export const initialize = (
  container: HTMLDivElement,
  options?: Partial<mapboxgl.MapboxOptions>,
) => {
  if (!mapboxgl.supported()) {
    throw new Error('Browser not supported');
  }

  return new mapboxgl.Map({
    container,
    localIdeographFontFamily: "'Roboto', sans-serif",
    style: 'mapbox://styles/mapbox/dark-v10',
    ...options,
  });
};

export interface MarkerElementOptions {
  className?: string;
  id?: string;
  onClick?: () => void;
  style?: Partial<CSSStyleDeclaration>;
  text?: string;
}

/** Builds a marker's DOM node; nest more with append() where needed. */
export const createMarkerElement = ({
  className,
  id,
  onClick,
  style,
  text,
}: MarkerElementOptions): HTMLElement => {
  const element = document.createElement('div');

  if (className) {
    element.className = className;
  }

  if (id) {
    element.id = id;
  }

  if (text) {
    element.textContent = text;
  }

  if (style) {
    Object.assign(element.style, style);
  }

  if (onClick) {
    element.addEventListener('click', onClick);
  }

  return element;
};

export const createMarker = (
  element: HTMLElement,
  coordinates: mapboxgl.LngLatLike,
  options?: mapboxgl.MarkerOptions,
) => new mapboxgl.Marker(element, options).setLngLat(coordinates);

export const addLayerAndSource = (
  map: mapboxgl.Map,
  sourceName: string,
  geoJson: GeoJSONLineString,
  color: string,
) => {
  map.addSource(sourceName, {
    data: {
      geometry: geoJson,
      properties: {},
      type: 'Feature',
    },
    type: 'geojson',
  });

  map.addLayer({
    id: sourceName,
    layout: {},
    paint: {
      'line-color': color,
      'line-width': 3,
    },
    source: sourceName,
    type: 'line',
  });

  const bounds = new mapboxgl.LngLatBounds(
    geoJson.coordinates[0] as Coordinate,
    geoJson.coordinates[0] as Coordinate,
  );

  for (const coordinate of geoJson.coordinates) {
    bounds.extend(coordinate as Coordinate);
  }

  map.fitBounds(bounds);

  return sourceName;
};
