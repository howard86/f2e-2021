import type { PlaceDetail, PlaceType } from '@/types/place';

/** Bodies longer than this fold behind 展開全文. */
export const COLLAPSE_THRESHOLD = 600;

export const shouldCollapse = (text: string) =>
  text.length > COLLAPSE_THRESHOLD;

export const truncate = (text: string | undefined, max = 120) => {
  const flat = (text ?? '').replace(/\s+/gu, ' ').trim();

  return flat.length > max ? `${flat.slice(0, max)}…` : flat;
};

export const formatDate = (iso: string | undefined) => {
  if (!iso) {
    return;
  }
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return;
  }

  return new Intl.DateTimeFormat('zh-TW', {
    day: 'numeric',
    month: 'long',
    timeZone: 'Asia/Taipei',
    year: 'numeric',
  }).format(date);
};

export const directionsUrl = (position?: PlaceDetail['position']) =>
  position
    ? `https://www.google.com/maps/dir/?api=1&destination=${position.lat}%2C${position.lng}`
    : undefined;

export const mapSearchUrl = (position: { lat: number; lng: number }) =>
  `https://www.google.com/maps/search/?api=1&query=${position.lat}%2C${position.lng}`;

const pad = (value: string | undefined) => value ?? '00';

/** `20260131T093000` in Asia/Taipei wall-clock time. */
export const toIcsLocal = (iso: string) => {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return;
  }
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      day: '2-digit',
      hour: '2-digit',
      hourCycle: 'h23',
      minute: '2-digit',
      month: '2-digit',
      second: '2-digit',
      timeZone: 'Asia/Taipei',
      year: 'numeric',
    })
      .formatToParts(date)
      .map((part) => [part.type, part.value]),
  );

  return `${pad(parts.year)}${pad(parts.month)}${pad(parts.day)}T${pad(parts.hour)}${pad(parts.minute)}${pad(parts.second)}`;
};

const escapeIcs = (text: string) =>
  text
    .replace(/\\/gu, '\\\\')
    .replace(/\n/gu, '\\n')
    .replace(/,/gu, '\\,')
    .replace(/;/gu, ';');

export const buildIcs = (
  detail: Pick<PlaceDetail, 'calendar' | 'description' | 'id' | 'name'> & {
    location?: string;
  },
) => {
  if (!detail.calendar) {
    return;
  }
  const start = toIcsLocal(detail.calendar.start);
  const end = toIcsLocal(detail.calendar.end);

  if (!(start && end)) {
    return;
  }
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//scene//TW',
    'CALSCALE:GREGORIAN',
    'BEGIN:VTIMEZONE',
    'TZID:Asia/Taipei',
    'BEGIN:STANDARD',
    'DTSTART:19700101T000000',
    'TZOFFSETFROM:+0800',
    'TZOFFSETTO:+0800',
    'TZNAME:CST',
    'END:STANDARD',
    'END:VTIMEZONE',
    'BEGIN:VEVENT',
    `UID:${detail.id}@scene`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]|\.\d{3}/gu, '')}`,
    `DTSTART;TZID=Asia/Taipei:${start}`,
    `DTEND;TZID=Asia/Taipei:${end}`,
    `SUMMARY:${escapeIcs(detail.name)}`,
  ];

  if (detail.description) {
    lines.push(`DESCRIPTION:${escapeIcs(truncate(detail.description, 300))}`);
  }
  if (detail.location) {
    lines.push(`LOCATION:${escapeIcs(detail.location)}`);
  }
  lines.push('END:VEVENT', 'END:VCALENDAR');

  return lines.join('\r\n');
};

const LD_TYPE: Record<PlaceType, string> = {
  activity: 'Event',
  hotel: 'Hotel',
  restaurant: 'Restaurant',
  scene: 'TouristAttraction',
};

export const buildJsonLd = (detail: PlaceDetail) => {
  const street = detail.facts.find((fact) => fact.kind === 'map')?.value;
  const telephone = detail.facts.find((fact) => fact.kind === 'phone')?.value;
  const address = {
    '@type': 'PostalAddress',
    addressCountry: 'TW',
    addressLocality: detail.town,
    addressRegion: detail.city,
    streetAddress: street,
  };

  return {
    '@context': 'https://schema.org',
    '@type': LD_TYPE[detail.type],
    address,
    description: truncate(detail.description, 300) || undefined,
    endDate: detail.type === 'activity' ? detail.endDate : undefined,
    geo: detail.position
      ? {
          '@type': 'GeoCoordinates',
          latitude: detail.position.lat,
          longitude: detail.position.lng,
        }
      : undefined,
    image: detail.images.map((image) => image.url),
    name: detail.name,
    startDate: detail.type === 'activity' ? detail.startDate : undefined,
    telephone,
    url: detail.websiteUrl,
    ...(detail.type === 'activity'
      ? {
          location: {
            '@type': 'Place',
            address,
            name: detail.town ?? detail.city,
          },
        }
      : {}),
  };
};

/** Safe to inline in a script tag. */
export const serializeJsonLd = (data: object) =>
  JSON.stringify(data).replace(/</gu, '\\u003c');
