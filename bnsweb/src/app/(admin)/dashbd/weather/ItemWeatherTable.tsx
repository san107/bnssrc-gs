import React from 'react';
import * as weatherutils from '@/utils/weather-utils';
import { IfTbWeather } from '@/models/tb_weather';
import { IfWeather } from '@/models/weather';

type Props = {
  region: IfTbWeather;
  weatherData?: {
    pops: IfWeather[];
    resultMsg?: string;
    timestamp: number;
  };
  onSelect: (data: any, resultMsg?: string) => void;
  onFetchData?: () => void;
};

const ItemWeatherTable = ({ region, weatherData, onSelect }: Props) => {
  const renderWeatherContent = () => {
    if (
      weatherData &&
      weatherData.pops &&
      weatherData.resultMsg !== 'ERROR' &&
      weatherData.resultMsg !== 'NO_DATA'
    ) {
      // 현재 강수확률 계산
      const currentPop =
        weatherData.pops?.find(
          (pop) =>
            pop.fcstDate === weatherutils.getToday()?.date &&
            pop.fcstTime === weatherutils.getToday()?.time
        )?.fcstValue || '0.0';

      return (
        <tr onClick={() => onSelect(weatherData.pops, weatherData.resultMsg)}>
          <td>{region.wt_rgn_nm}</td>
          <td>{weatherData.pops ? weatherutils.getYesterdayPopRate(weatherData.pops) : '0.0'}</td>
          <td>{weatherData.pops ? weatherutils.getTodayPopRate(weatherData.pops) : '0.0'}</td>
          <td>{Number(currentPop).toFixed(1)}</td>
        </tr>
      );
    }
  };

  return renderWeatherContent();
};

export default ItemWeatherTable;
