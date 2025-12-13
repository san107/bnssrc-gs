import React from 'react';
import { Grid } from '@mui/material';
import * as weatherutils from '@/utils/weather-utils';
import ChartWeatherPopGauge from '@/app/(admin)/dashbd/dark/chart/ChartWeatherPopGauge';
import { IfTbWater, TbWater } from '@/models/water/tb_water';
import useWeather from '@/hooks/useWeather';
import { useSettingsStore } from '@/store/useSettingsStore';
import { RainyEffect } from '@/app/(admin)/dashbd/weather/effect/RainyEffect';
import { SunnyEffect } from '@/app/(admin)/dashbd/weather/effect/SunnyEffect';
import { SnowyEffect } from '@/app/(admin)/dashbd/weather/effect/SnowyEffect';
import { CloudyEffect } from '@/app/(admin)/dashbd/weather/effect/CloudyEffect';

type Props = {
  water?: IfTbWater;
};

const BoxWeather = ({ water }: Props) => {
  const { tmp, sky, pty, pop, resultMsg } = useWeather(water || new TbWater());
  const { theme } = useSettingsStore();
  const weatherStat = weatherutils.getWeatherStat(pty || 0, sky || 0);

  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <div className='weather-info-box'>
          {(weatherStat === '비' || weatherStat === '소나기') && <RainyEffect theme={theme} />}
          {weatherStat === '맑음' && <SunnyEffect />}
          {weatherStat === '눈' && <SnowyEffect theme={theme} />}
          {(weatherStat === '구름많음' || weatherStat === '흐림') && <CloudyEffect theme={theme} />}
          {weatherStat === '비/눈' && (
            <>
              <RainyEffect theme={theme} />
              <SnowyEffect theme={theme} />
            </>
          )}
          <div className={theme === 'dark' ? 'weather-curr-info' : 'weather-curr-info-light'}>
            {resultMsg && sky ? (
              <Grid container spacing={2} columns={{ xs: 1, md: 12, lg: 12 }}>
                <Grid size={{ xs: 1, md: 4, lg: 4 }}>
                  날씨
                  <span
                    className={
                      theme === 'dark'
                        ? 'weather-curr-item weather-txt'
                        : 'weather-curr-item-light weather-txt'
                    }
                  >
                    {weatherStat}
                  </span>
                  <span
                    className={
                      theme === 'dark'
                        ? 'weather-curr-item2 weather-icon'
                        : 'weather-curr-item2 weather-icon-light'
                    }
                  >
                    <img
                      src={weatherutils.getWeatherIcon2(pty || 0, sky || 0)}
                      alt={weatherStat}
                      width='80px'
                    />
                  </span>
                </Grid>
                <Grid size={{ xs: 1, md: 4, lg: 4 }}>
                  기온
                  <span className='weather-curr-item3'>{tmp}℃</span>
                </Grid>
                <Grid size={{ xs: 1, md: 4, lg: 4 }}>
                  강수확률
                  {pop && <ChartWeatherPopGauge data={pop} />}
                </Grid>
              </Grid>
            ) : resultMsg === 'ERROR' || resultMsg === 'NO_DATA' ? (
              <span style={{ color: 'red' }}>날씨 정보를 불러올 수 없습니다.</span>
            ) : (
              <span className='load-weather'>날씨 정보를 불러오는 중입니다</span>
            )}
          </div>
        </div>
      </Grid>
    </Grid>
  );
};

export default BoxWeather;
