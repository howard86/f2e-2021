const TAIPEI_OFFSET_MS = 8 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const REVALIDATE_SECONDS = 3600;

const handleArrayParam = (array?: string[]) =>
  array ? array.join(',') : undefined;

/** CWB timestamps are Taipei local time without an offset. */
const toIso = (value: string) =>
  new Date(`${value.replace(' ', 'T')}+08:00`).toISOString();

const taipeiDay = (time: number) =>
  Math.floor((time + TAIPEI_OFFSET_MS) / DAY_MS);

const taipeiHour = (time: number) =>
  new Date(time + TAIPEI_OFFSET_MS).getUTCHours();

/** 今日白天 / 今晚明晨 / 明日白天 … from a period's start relative to `now`. */
export const getPeriodLabel = (startIso: string, now: Date = new Date()) => {
  const start = new Date(startIso).getTime();
  const dayDiff = taipeiDay(start) - taipeiDay(now.getTime());
  const hour = taipeiHour(start);
  const isDay = hour >= 5 && hour < 17;

  if (isDay) {
    if (dayDiff <= 0) {
      return '今日白天';
    }

    return dayDiff === 1 ? '明日白天' : '後日白天';
  }

  if (dayDiff <= 0) {
    return '今晚明晨';
  }

  return dayDiff === 1 ? '明晚' : '後日晚上';
};

const findElement = (
  location: OpenData.Location,
  name: string,
): OpenData.Time[] =>
  location.weatherElement.find((element) => element.elementName === name)
    ?.time ?? [];

/** Pure mapping of a CWB F-C0032-001 payload into per-city periods. */
export const mapWeatherLocations = (
  locations: OpenData.Location[],
  now: Date = new Date(),
): OpenData.CityWeather[] =>
  locations.map((location) => {
    const wx = findElement(location, 'Wx');
    const minT = findElement(location, 'MinT');
    const maxT = findElement(location, 'MaxT');
    const pop = findElement(location, 'PoP');

    const periods = wx.map((time, index) => {
      const start = toIso(time.startTime);

      return {
        end: toIso(time.endTime),
        label: getPeriodLabel(start, now),
        maxT: maxT[index]?.parameter.parameterName ?? '',
        minT: minT[index]?.parameter.parameterName ?? '',
        pop: pop[index]?.parameter.parameterName,
        start,
        weather: time.parameter.parameterName as OpenData.Weather,
      };
    });

    return {
      city: location.locationName,
      id: location.locationName,
      maxT: maxT[0]?.parameter.parameterName ?? '',
      minT: minT[0]?.parameter.parameterName ?? '',
      periods,
      weather: wx[0]?.parameter.parameterName as OpenData.Weather,
    };
  });

const apiGet = async <T>(
  url: string,
  params: Partial<Omit<OpenData.WeatherParam, 'locationName'>>,
): Promise<T> => {
  const { elementName, ...rest } = params;

  const searchParam = new URLSearchParams({
    Authorization: process.env.OPEN_DATA_CWB_API_KEY ?? '',
    elementName: handleArrayParam(elementName) ?? '',
    format: 'JSON',
    sort: 'startTime',
    ...rest,
  });

  const response = await fetch(
    `${process.env.OPEN_DATA_CWB_BASE_URL}/${url}?${searchParam.toString()}`,
    {
      headers: {
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      next: { revalidate: REVALIDATE_SECONDS },
    },
  );

  if (response.ok) {
    return response.json();
  }

  throw new Error(`CWB ${response.status} ${response.statusText}`);
};

/**
 * Forecast periods for every city. Resolves to an empty list when the CWB
 * keys are missing or the request fails, so pages render without weather.
 */
const getWeathers = async (): Promise<OpenData.CityWeather[]> => {
  if (
    !(process.env.OPEN_DATA_CWB_API_KEY && process.env.OPEN_DATA_CWB_BASE_URL)
  ) {
    return [];
  }

  try {
    const response = await apiGet<OpenData.WeatherResponse>('F-C0032-001', {
      elementName: ['Wx', 'MinT', 'MaxT', 'PoP'],
    });

    if (!response.success) {
      return [];
    }

    return mapWeatherLocations(response.records.location);
  } catch (error) {
    console.error(error);

    return [];
  }
};

export default getWeathers;
