declare namespace OpenData {
  // TODO: replace with real api from https://opendata.cwb.gov.tw/dist/opendata-swagger.html#/預報/get_v1_rest_datastore_F_C0032_001
  interface WeatherPeriod {
    /** ISO date-time of the period end. */
    end: string;
    /** 今日白天 / 今晚明晨 / 明日白天 … */
    label: string;
    maxT: string;
    minT: string;
    /** Probability of precipitation, percent. */
    pop?: string;
    /** ISO date-time of the period start. */
    start: string;
    weather: Weather;
  }

  interface CityWeather {
    /** Chinese city name as published by CWB, e.g. 臺北市. */
    city: string;
    id: string;
    maxT: string;
    minT: string;
    /** Current and following periods, earliest first. */
    periods: WeatherPeriod[];
    weather: Weather;
  }

  type Weather =
    | '晴'
    | '短暫雨'
    | '多雲'
    | '多雲時晴'
    | '多雲時陰'
    | '晴時多雲'
    | '多雲短暫雨'
    | '陰天'
    | '晴時多雲'
    | '陰時多雲'
    | '陰短暫雨';

  interface WeatherParam {
    Authorization: string;
    elementName: string[];
    format: string;
    limit: string; // as number
    offset: string; // as number;
    // locationName: string[];
    sort: string;
    // startTime: string[]; // can be array
    timeFrom: string; // as date
    timeTo: string; // as date
  }

  interface WeatherResponse {
    records: {
      datasetDescription: string;
      location: Location[];
    };
    result: {
      resource_id: string;
      fields: Field[];
    };
    success: string;
  }

  interface Field {
    id: string;
    type: string;
  }

  interface Location {
    locationName: string;
    weatherElement: WeatherElement[];
  }

  interface WeatherElement {
    elementName: string;
    time: Time[];
  }

  interface Time {
    endTime: string;
    parameter: {
      parameterName: string;
      parameterValue?: string;
      parameterUnit?: string;
    };
    startTime: string;
  }
}
