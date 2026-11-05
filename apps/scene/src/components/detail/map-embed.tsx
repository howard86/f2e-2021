import { Box } from '@chakra-ui/react';

const MapEmbed = ({
  lat,
  lng,
  name,
}: {
  lat: number;
  lng: number;
  name: string;
}) => {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY;

  if (!key) {
    return null;
  }

  return (
    <Box
      asChild
      aspectRatio="4 / 3"
      border="none"
      borderRadius="lg"
      overflow="hidden"
      w="full"
    >
      <iframe
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        sandbox="allow-scripts allow-same-origin allow-popups"
        src={`https://www.google.com/maps/embed/v1/place?${new URLSearchParams({
          center: `${lat},${lng}`,
          key,
          language: 'zh-TW',
          q: `${lat},${lng}`,
          region: 'tw',
          zoom: '16',
        }).toString()}`}
        title={`${name} 地圖`}
      />
    </Box>
  );
};

export default MapEmbed;
