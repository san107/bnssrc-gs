import { useCallback, useEffect, useState } from 'react';
import * as weatherutils from '@/utils/weather-utils';
import { IfTbWater } from '@/models/water/tb_water';
import { IfWeather } from '@/models/weather';
import { gconf } from '@/utils/gconf';

const useWeather = (water: IfTbWater) => {
  // 날씨 정보
  const [tmp, setTmp] = useState<number>(0); // 기온
  const [sky, setSky] = useState<number>(0); // 하늘상태
  const [pty, setPty] = useState<number>(0); // 강수형태
  const [pop, setPop] = useState<number>(0); // 강수확률
  const [wsd, setWsd] = useState<number>(0); // 풍속
  const [vec, setVec] = useState<number>(0); // 풍향
  const [pops, setPops] = useState<IfWeather[]>([]); // 강수확률 목록
  const [wsds, setWsds] = useState<IfWeather[]>([]); // 풍속 폭록
  const [weatherList, setWeatherList] = useState<IfWeather[]>([]); // 날씨 전체 목록
  const [resultMsg, setResultMsg] = useState<string | undefined>(undefined); // api 결과

  const initData = () => {
    setTmp(0);
    setSky(0);
    setPty(0);
    setPop(0);
    setWsd(0);
    setVec(0);
    setPops([]);
    setWsds([]);
    setWeatherList([]);
    setResultMsg(undefined);
  };

  const getWeather = useCallback(async () => {
    try {
      initData();

      const url = gconf.weatherUrl;
      const today = weatherutils.getToday();
      const yesterday = weatherutils.getYesterday();
      const date = today?.date;
      const time = today?.time;
      // const lat = water?.water_lat
      //   ?.toString()
      //   .substring(0, water?.water_lat?.toString().indexOf('.'));
      // const lng = water?.water_lng
      //   ?.toString()
      //   .substring(0, water?.water_lng?.toString().indexOf('.'));
      const latlng = weatherutils.dfs_xy_conv('toXY', water?.water_lat || 0, water?.water_lng || 0);
      const lat = latlng.x;
      const lng = latlng.y;

      // Api 테스트 시 전일일자 검색은 base_time이 1100 으로만 검색이 됨 (12시간)
      // 현재시간으로는 안나옴, 매 정시 06시 발표 (0500으로 검색)
      const wInfo = await fetch(
        `${url}?serviceKey=${weatherutils.getApiKey()}&base_date=${
          yesterday?.baseDate
        }&base_time=1100&nx=${lat}&ny=${lng}&pageNo=1&numOfRows=1000&dataType=JSON`
      );
      // console.log('wInfo', wInfo);
      if (!wInfo.ok) {
        setResultMsg('ERROR');
        return;
      }
      const wInfoJson = await wInfo.json();
      let wInfoList = wInfoJson.response?.body?.items?.item;
      let wInfoResult = wInfoJson.response?.header?.resultMsg; // NORMAL_SERVICE (정상), NO_DATA (데이터 없음)
      // console.log('wInfoResult', wInfoResult);

      // 전일일자로 데이터가 안나올때는 금일자로 재검색함.
      if (wInfoResult === 'NO_DATA') {
        const wInfo = await fetch(
          `${url}?serviceKey=${weatherutils.getApiKey()}&base_date=${
            today?.baseDate
          }&base_time=0500&nx=${lat}&ny=${lng}&pageNo=1&numOfRows=1000&dataType=JSON`
        );
        if (!wInfo.ok) {
          setResultMsg('ERROR');
          return;
        }
        const wInfoJson = await wInfo.json();
        wInfoList = wInfoJson.response?.body?.items?.item;
        wInfoResult = wInfoJson.response?.header?.resultMsg; // NORMAL_SERVICE (정상), NO_DATA (데이터 없음)
      }

      setWeatherList(wInfoList);

      // 기온
      const TMP = wInfoList?.filter(
        (item) => item?.category === 'TMP' && item?.fcstDate === date && item?.fcstTime === time
      );
      // 하늘상태
      const SKY = wInfoList?.filter(
        (item) => item?.category === 'SKY' && item?.fcstDate === date && item?.fcstTime === time
      );
      // 강수형태
      const PTY = wInfoList?.filter(
        (item) => item?.category === 'PTY' && item?.fcstDate === date && item?.fcstTime === time
      );
      // 강수확률
      const POP = wInfoList?.filter(
        (item) => item?.category === 'POP' && item?.fcstDate === date && item?.fcstTime === time
      );
      // 풍속
      const WSD = wInfoList?.filter(
        (item) => item?.category === 'WSD' && item?.fcstDate === date && item?.fcstTime === time
      );
      // 풍향
      const VEC = wInfoList?.filter(
        (item) => item?.category === 'VEC' && item?.fcstDate === date && item?.fcstTime === time
      );
      const POPS = wInfoList?.filter((item) => item?.category === 'POP');
      const WSDS = wInfoList?.filter((item) => item?.category === 'WSD');

      if (wInfoResult) setResultMsg(wInfoResult);
      if (TMP) setTmp(TMP && TMP[0]?.fcstValue);
      if (SKY) setSky(Number(SKY && SKY[0]?.fcstValue));
      if (PTY) setPty(Number(PTY && PTY[0]?.fcstValue));
      if (POP) setPop(POP && POP[0]?.fcstValue);
      if (WSD) setWsd(WSD && WSD[0]?.fcstValue);
      if (VEC) setVec(Number(VEC && VEC[0]?.fcstValue));
      if (POPS) setPops(POPS);
      if (WSDS) setWsds(WSDS);
    } catch (error) {
      console.log('error', error);
      setResultMsg('ERROR');
      return;
    }
  }, [water?.water_lat, water?.water_lng]);

  useEffect(() => {
    getWeather();
  }, [getWeather]);

  return { tmp, sky, pty, pop, wsd, vec, pops, wsds, weatherList, resultMsg };
};

export default useWeather;
