export class Weather {
  baseDate?: string;
  baseTime?: string;
  category?: string;
  fcstDate?: string;
  fcstTime?: string;
  fcstValue?: string;
  nx?: number;
  ny?: number;
}

export interface IfWeather extends Weather {}
