'use client';

import * as weatherutils from '@/utils/weather-utils';
import { TbWater } from '@/models/water/tb_water';
import useWeather from '@/hooks/useWeather';
import { useEffect, useState } from 'react';

const IndexWeather = () => {
  const region01 = new TbWater(); // 영월
  region01.water_lat = 37.1836860419285;
  region01.water_lng = 128.461783934728;
  const region02 = new TbWater(); // 상동읍
  region02.water_lat = 37.1269849168596;
  region02.water_lng = 128.826799439002;
  const region03 = new TbWater(); // 중동면
  region03.water_lat = 37.1452872087537;
  region03.water_lng = 128.680530612342;
  const region04 = new TbWater(); // 김삿갓면
  region04.water_lat = 37.1256797470207;
  region04.water_lng = 128.570085899718;
  const region05 = new TbWater(); // 영월북면
  region05.water_lat = 37.2544645252444;
  region05.water_lng = 128.455193189019;
  const region06 = new TbWater(); // 영월남면
  region06.water_lat = 37.1865451028246;
  region06.water_lng = 128.404493044827;
  const region07 = new TbWater(); // 한반도면
  region07.water_lat = 37.2367970270269;
  region07.water_lng = 128.328378893623;
  const region08 = new TbWater(); // 무릉도원면
  region08.water_lat = 37.2883503881401;
  region08.water_lng = 128.268649175287;
  const region09 = new TbWater(); // 주천
  region09.water_lat = 37.2721876092467;
  region09.water_lng = 128.268910017243;
  const region10 = new TbWater(); // 상동
  region10.water_lat = 37.1269849168596;
  region10.water_lng = 128.826799439002;

  const { pop: pop01, pops: pops01 } = useWeather(region01);
  const { pop: pop02, pops: pops02 } = useWeather(region02);
  const { pop: pop03, pops: pops03 } = useWeather(region03);
  const { pop: pop04, pops: pops04 } = useWeather(region04);
  const { pop: pop05, pops: pops05 } = useWeather(region05);
  const { pop: pop06, pops: pops06 } = useWeather(region06);
  const { pop: pop07, pops: pops07 } = useWeather(region07);
  const { pop: pop08, pops: pops08 } = useWeather(region08);
  const { pop: pop09, pops: pops09 } = useWeather(region09);
  const { pop: pop10, pops: pops10 } = useWeather(region10);

  const [beforePopRate01, setBeforePopRate01] = useState<string>('0.0');
  const [beforePopRate02, setBeforePopRate02] = useState<string>('0.0');
  const [beforePopRate03, setBeforePopRate03] = useState<string>('0.0');
  const [beforePopRate04, setBeforePopRate04] = useState<string>('0.0');
  const [beforePopRate05, setBeforePopRate05] = useState<string>('0.0');
  const [beforePopRate06, setBeforePopRate06] = useState<string>('0.0');
  const [beforePopRate07, setBeforePopRate07] = useState<string>('0.0');
  const [beforePopRate08, setBeforePopRate08] = useState<string>('0.0');
  const [beforePopRate09, setBeforePopRate09] = useState<string>('0.0');
  const [beforePopRate10, setBeforePopRate10] = useState<string>('0.0');

  const [todayPopRate01, setTodayPopRate01] = useState<string>('0.0');
  const [todayPopRate02, setTodayPopRate02] = useState<string>('0.0');
  const [todayPopRate03, setTodayPopRate03] = useState<string>('0.0');
  const [todayPopRate04, setTodayPopRate04] = useState<string>('0.0');
  const [todayPopRate05, setTodayPopRate05] = useState<string>('0.0');
  const [todayPopRate06, setTodayPopRate06] = useState<string>('0.0');
  const [todayPopRate07, setTodayPopRate07] = useState<string>('0.0');
  const [todayPopRate08, setTodayPopRate08] = useState<string>('0.0');
  const [todayPopRate09, setTodayPopRate09] = useState<string>('0.0');
  const [todayPopRate10, setTodayPopRate10] = useState<string>('0.0');

  useEffect(() => {
    if (pops01) {
      setBeforePopRate01(weatherutils.getYesterdayPopRate(pops01));
      setTodayPopRate01(weatherutils.getTodayPopRate(pops01));
    }
    if (pops02) {
      setBeforePopRate02(weatherutils.getYesterdayPopRate(pops02));
      setTodayPopRate02(weatherutils.getTodayPopRate(pops02));
    }
    if (pops03) {
      setBeforePopRate03(weatherutils.getYesterdayPopRate(pops03));
      setTodayPopRate03(weatherutils.getTodayPopRate(pops03));
    }
    if (pops04) {
      setBeforePopRate04(weatherutils.getYesterdayPopRate(pops04));
      setTodayPopRate04(weatherutils.getTodayPopRate(pops04));
    }
    if (pops05) {
      setBeforePopRate05(weatherutils.getYesterdayPopRate(pops05));
      setTodayPopRate05(weatherutils.getTodayPopRate(pops05));
    }
    if (pops06) {
      setBeforePopRate06(weatherutils.getYesterdayPopRate(pops06));
      setTodayPopRate06(weatherutils.getTodayPopRate(pops06));
    }
    if (pops07) {
      setBeforePopRate07(weatherutils.getYesterdayPopRate(pops07));
      setTodayPopRate07(weatherutils.getTodayPopRate(pops07));
    }
    if (pops08) {
      setBeforePopRate08(weatherutils.getYesterdayPopRate(pops08));
      setTodayPopRate08(weatherutils.getTodayPopRate(pops08));
    }
    if (pops09) {
      setBeforePopRate09(weatherutils.getYesterdayPopRate(pops09));
      setTodayPopRate09(weatherutils.getTodayPopRate(pops09));
    }
    if (pops10) {
      setBeforePopRate10(weatherutils.getYesterdayPopRate(pops10));
      setTodayPopRate10(weatherutils.getTodayPopRate(pops10));
    }
  }, [pops01, pops02, pops03, pops04, pops05, pops06, pops07, pops08, pops09, pops10]);

  return (
    <div>
      <table className='camera'>
        <thead>
          <tr>
            <th>지역명</th>
            <th>전일강우</th>
            <th>금일강우</th>
            <th>현재시간</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>영월</td>
            <td>{beforePopRate01}</td>
            <td>{todayPopRate01}</td>
            <td>{Number(pop01).toFixed(1)}</td>
          </tr>
          <tr>
            <td>상동읍</td>
            <td>{beforePopRate02}</td>
            <td>{todayPopRate02}</td>
            <td>{Number(pop02).toFixed(1)}</td>
          </tr>
          <tr>
            <td>중동면</td>
            <td>{beforePopRate03}</td>
            <td>{todayPopRate03}</td>
            <td>{Number(pop03).toFixed(1)}</td>
          </tr>
          <tr>
            <td>김삿갓면</td>
            <td>{beforePopRate04}</td>
            <td>{todayPopRate04}</td>
            <td>{Number(pop04).toFixed(1)}</td>
          </tr>
          <tr>
            <td>영월북면</td>
            <td>{beforePopRate05}</td>
            <td>{todayPopRate05}</td>
            <td>{Number(pop05).toFixed(1)}</td>
          </tr>
          <tr>
            <td>영월남면</td>
            <td>{beforePopRate06}</td>
            <td>{todayPopRate06}</td>
            <td>{Number(pop06).toFixed(1)}</td>
          </tr>
          <tr>
            <td>한반도면</td>
            <td>{beforePopRate07}</td>
            <td>{todayPopRate07}</td>
            <td>{Number(pop07).toFixed(1)}</td>
          </tr>
          <tr>
            <td>무릉도원면</td>
            <td>{beforePopRate08}</td>
            <td>{todayPopRate08}</td>
            <td>{Number(pop08).toFixed(1)}</td>
          </tr>
          <tr>
            <td>주천</td>
            <td>{beforePopRate09}</td>
            <td>{todayPopRate09}</td>
            <td>{Number(pop09).toFixed(1)}</td>
          </tr>
          <tr>
            <td>상동</td>
            <td>{beforePopRate10}</td>
            <td>{todayPopRate10}</td>
            <td>{Number(pop10).toFixed(1)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default IndexWeather;
