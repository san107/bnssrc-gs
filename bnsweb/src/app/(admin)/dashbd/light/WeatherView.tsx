import React, { useCallback, useEffect, useState } from 'react';
import { Grid } from '@mui/material';
import * as weatherutils from '@/utils/weather-utils';
import * as maputils from '@/utils/map-utils';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import { IfWeather } from '@/models/weather';
import WeatherPopGraph from '@/app/(admin)/dashbd/light/WeatherPopGraph';
import WeatherWsdGraph from '@/app/(admin)/dashbd/light/WeatherWsdGraph';
import GaugePopGraph from '@/app/(admin)/dashbd/light/GaugePopGraph';
import { IfTbWater } from '@/models/water/tb_water';
import axios from 'axios';

type Props = {
  weatherList?: IfWeather[];
  currTmp?: number;
  currPty?: number;
  currSky?: number;
  currPop?: number;
  water?: IfTbWater;
};

const WeatherView = ({ weatherList, currTmp, currPty, currSky, currPop, water }: Props) => {
  const [tmp, setTmp] = useState<IfWeather[]>([]);
  const [sky, setSky] = useState<IfWeather[]>([]);
  const [pty, setPty] = useState<IfWeather[]>([]);
  const [pop, setPop] = useState<IfWeather[]>([]);
  const [wsd, setWsd] = useState<IfWeather[]>([]);
  const [vec, setVec] = useState<IfWeather[]>([]);
  const [address, setAddress] = useState<string>('');

  const hideWeatherPopup = () => {
    const notification = document.getElementById('overlay-slidedown2');
    if (notification) notification?.classList.remove('show');
    if (notification) notification?.classList.add('hide');
  };

  const getWeather = useCallback(async () => {
    setTmp(weatherList?.filter((item) => item?.category === 'TMP') || []); // 기온
    setSky(weatherList?.filter((item) => item?.category === 'SKY') || []); // 하늘상태
    setPty(weatherList?.filter((item) => item?.category === 'PTY') || []); // 강수형태
    setPop(weatherList?.filter((item) => item?.category === 'POP') || []); // 강수확률
    setWsd(weatherList?.filter((item) => item?.category === 'WSD') || []); // 풍속
    setVec(weatherList?.filter((item) => item?.category === 'VEC') || []); // 풍향
  }, [weatherList]);

  useEffect(() => {
    getWeather();
    axios
      .get(
        `/api/req/address?service=address&request=getAddress&version=2.0&crs=epsg:4326&point=${
          water?.water_lng
        },${
          water?.water_lat
        }&format=json&key=${maputils.getApiKey()}&type=both&zipcode=true&simple=false`
      )
      .then((res) => {
        // console.log('res', res.data.response.result[0]);
        setAddress(res.data.response.result[0].structure.level2);
      })
      .catch((err) => {
        console.log('err', err);
      });
  }, [getWeather, water]);

  return (
    <div className='full-overlay2 overlay-slidedown2' id='overlay-slidedown2'>
      <button type='button' className='overlay-close' onClick={hideWeatherPopup}>
        Close
      </button>
      <Grid container spacing={2}>
        <Grid size={12}>
          <div className='weather-header'>
            <WbSunnyIcon sx={{ fontSize: '40px', marginTop: '-10px' }} /> 날씨 상세 정보 ({address})
          </div>
        </Grid>
        <Grid size={4}>
          <div className='weather-info-box'>
            <div className='weather-graph'>현재 날씨 정보</div>
            <div className='weather-curr-info'>
              <Grid container spacing={2}>
                <Grid size={4}>
                  날씨
                  <span className='weather-curr-item'>
                    {/* {currPty === '없음' ? currSky : currPty} */}
                    {weatherutils.getWeatherStat(currPty || 0, currSky || 0)}
                  </span>
                  <span className='weather-curr-item2'>
                    {/* <img
                      src={weatherutils.getWeatherIcon(currPty || '', currSky || '')}
                      alt={currPty === '없음' ? currSky : currPty}
                      width='80px'
                    /> */}
                    <img
                      src={weatherutils.getWeatherIcon2(currPty || 0, currSky || 0)}
                      alt={weatherutils.getWeatherStat(currPty || 0, currSky || 0)}
                      width='80px'
                    />
                  </span>
                </Grid>
                <Grid size={4}>
                  기온
                  <span className='weather-curr-item3'>{currTmp}℃</span>
                </Grid>
                <Grid size={4}>
                  강수확률
                  {/* <span className='weather-curr-item'>{currPop}%</span> */}
                  <GaugePopGraph data={currPop} />
                </Grid>
              </Grid>
            </div>
          </div>
        </Grid>
        <Grid size={4}>
          <div className='weather-info-box'>
            <div className='weather-graph'>강수확률</div>
            <WeatherPopGraph data={pop} />
          </div>
        </Grid>
        <Grid size={4}>
          <div className='weather-info-box'>
            <div className='weather-graph'>풍속</div>
            <WeatherWsdGraph data={wsd} />
          </div>
        </Grid>
        <Grid size={2}>
          <div className='weather-info-box'>
            <span className='weather-info-title'>날씨</span>
            <span className='weather-info'>
              {(sky || []).map((row) => (
                <div key={row?.fcstDate + '_' + row?.fcstTime} className='weather-items'>
                  <span className='fleft'>
                    {weatherutils.strToDatetime(row?.fcstDate || '', row?.fcstTime || '')}
                  </span>{' '}
                  <span className='fright'>{weatherutils.getSkyStat(Number(row?.fcstValue))}</span>
                  <br />
                </div>
              ))}
            </span>
          </div>
        </Grid>
        <Grid size={2}>
          <div className='weather-info-box'>
            <span className='weather-info-title'>기온</span>
            <span className='weather-info'>
              {(tmp || []).map((row) => (
                <div key={row?.fcstDate + '_' + row?.fcstTime} className='weather-items'>
                  <span className='fleft'>
                    {weatherutils.strToDatetime(row?.fcstDate || '', row?.fcstTime || '')}
                  </span>
                  <span className='fright'>{row?.fcstValue} ℃</span>
                  <br />
                </div>
              ))}
            </span>
          </div>
        </Grid>
        <Grid size={2}>
          <div className='weather-info-box'>
            <span className='weather-info-title'>강수형태</span>
            <span className='weather-info'>
              {(pty || []).map((row) => (
                <div key={row?.fcstDate + '_' + row?.fcstTime} className='weather-items'>
                  <span className='fleft'>
                    {weatherutils.strToDatetime(row?.fcstDate || '', row?.fcstTime || '')}
                  </span>
                  <span className='fright'>{weatherutils.getPtyStat(Number(row.fcstValue))}</span>
                  <br />
                </div>
              ))}
            </span>
          </div>
        </Grid>
        <Grid size={2}>
          <div className='weather-info-box'>
            <span className='weather-info-title'>강수확률</span>
            <span className='weather-info'>
              {(pop || []).map((row) => (
                <div key={row?.fcstDate + '_' + row?.fcstTime} className='weather-items'>
                  <span className='fleft'>
                    {weatherutils.strToDatetime(row?.fcstDate || '', row?.fcstTime || '')}
                  </span>
                  <span className='fright'>{row?.fcstValue} %</span>
                  <br />
                </div>
              ))}
            </span>
          </div>
        </Grid>
        <Grid size={2}>
          <div className='weather-info-box'>
            <span className='weather-info-title'>풍향</span>
            <span className='weather-info'>
              {(vec || []).map((row) => (
                <div key={row?.fcstDate + '_' + row?.fcstTime} className='weather-items'>
                  <span className='fleft'>
                    {weatherutils.strToDatetime(row?.fcstDate || '', row?.fcstTime || '')}
                  </span>
                  <span className='fright'>{weatherutils.getVecStat(Number(row?.fcstValue))}</span>
                  <br />
                </div>
              ))}
            </span>
          </div>
        </Grid>
        <Grid size={2}>
          <div className='weather-info-box'>
            <span className='weather-info-title'>풍속</span>
            <span className='weather-info'>
              {(wsd || []).map((row) => (
                <div key={row?.fcstDate + '_' + row?.fcstTime} className='weather-items'>
                  <span className='fleft'>
                    {weatherutils.strToDatetime(row?.fcstDate || '', row?.fcstTime || '')}
                  </span>
                  <span className='fright'>{row?.fcstValue} m/s</span>
                  <br />
                </div>
              ))}
            </span>
          </div>
        </Grid>
      </Grid>
    </div>
  );
};

export default WeatherView;
