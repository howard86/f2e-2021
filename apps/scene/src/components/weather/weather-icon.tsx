import type { IconProps } from '@chakra-ui/react';

import CloudIcon from '@/components/icons/cloud-icon';
import RainWithCloudIcon from '@/components/icons/rain-with-cloud-icon';
import SunIcon from '@/components/icons/sun-icon';
import SunWithCloudIcon from '@/components/icons/sun-with-cloud-icon';
import UmbrellaIcon from '@/components/icons/umbrella-icon';

const getWeatherIcon = (weather: OpenData.Weather | string) => {
  switch (weather) {
    case '多雲':
    case '陰天':
    case '陰時多雲':
    case '多雲時陰':
      return CloudIcon;
    case '短暫雨':
      return UmbrellaIcon;
    case '陰短暫雨':
    case '多雲短暫雨':
      return RainWithCloudIcon;
    case '晴':
      return SunIcon;
    default:
      return SunWithCloudIcon;
  }
};

interface WeatherIconProps extends IconProps {
  weather: OpenData.Weather | string;
}

const WeatherIcon = ({ weather, ...props }: WeatherIconProps) => {
  const Icon = getWeatherIcon(weather);

  return <Icon aria-hidden {...props} />;
};

export default WeatherIcon;
