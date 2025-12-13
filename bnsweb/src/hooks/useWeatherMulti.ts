import { useState, useCallback } from 'react';
import * as weatherutils from '@/utils/weather-utils';
import { IfTbWeather } from '@/models/tb_weather';
import { gconf } from '@/utils/gconf';
import { useWeatherResionStore } from '@/hooks/useWeatherResion';

interface WeatherCache {
  data: any;
  timestamp: number;
}

interface WeatherCacheStorage {
  [key: string]: WeatherCache;
}

// 캐시 설정
const CACHE_DURATION = 5 * 60 * 1000; // 5분
const CACHE_KEY = 'weather_data_cache';

const getCachedWeatherData = (): WeatherCacheStorage => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (error) {
    console.warn('캐시 데이터 로드 실패:', error);
  }
  return {};
};

const setCachedWeatherData = (cache: WeatherCacheStorage): void => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.warn('캐시 데이터 저장 실패:', error);
  }
};

// 캐시가 유효한지 확인
const isCacheValid = (timestamp: number): boolean => {
  return Date.now() - timestamp < CACHE_DURATION;
};

const fetchWeatherData = async (
  lat: number,
  lng: number
): Promise<{ pops: any[]; resultMsg: string }> => {
  try {
    //const url = 'https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst';
    const url = gconf.weatherUrl;
    const today = weatherutils.getToday();
    const yesterday = weatherutils.getYesterday();

    const latlng = weatherutils.dfs_xy_conv('toXY', lat, lng);
    const nx = latlng.x;
    const ny = latlng.y;

    // 전일자로 먼저 시도
    let wInfo = await fetch(
      `${url}?serviceKey=${weatherutils.getApiKey()}&base_date=${
        yesterday?.baseDate
      }&base_time=1100&nx=${nx}&ny=${ny}&pageNo=1&numOfRows=1000&dataType=JSON`
    );

    if (!wInfo.ok) {
      return { pops: [], resultMsg: 'ERROR' };
    }

    let wInfoJson = await wInfo.json();
    let wInfoList = wInfoJson.response?.body?.items?.item;
    let wInfoResult = wInfoJson.response?.header?.resultMsg;

    // 전일자로 데이터가 안나올때는 금일자로 재검색
    if (wInfoResult === 'NO_DATA') {
      wInfo = await fetch(
        `${url}?serviceKey=${weatherutils.getApiKey()}&base_date=${
          today?.baseDate
        }&base_time=0500&nx=${nx}&ny=${ny}&pageNo=1&numOfRows=1000&dataType=JSON`
      );

      if (!wInfo.ok) {
        return { pops: [], resultMsg: 'ERROR' };
      }

      wInfoJson = await wInfo.json();
      wInfoList = wInfoJson.response?.body?.items?.item;
      wInfoResult = wInfoJson.response?.header?.resultMsg;
    }

    const pops = wInfoList?.filter((item: any) => item?.category === 'POP') || [];

    return { pops, resultMsg: wInfoResult };
  } catch (error) {
    console.log('error', error);
    return { pops: [], resultMsg: 'ERROR' };
  }
};

const useWeatherMulti = () => {
  const [weatherData, setWeatherData] = useState<{ [key: string]: any }>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 지역 키 생성
  const getRegionKey = (region: IfTbWeather): string => {
    return `${region.wt_seq}_${region.wt_rgn_nm}`;
  };

  // 캐시된 데이터에서 특정 지역 데이터 가져오기
  const getCachedRegionData = (regionKey: string): any | null => {
    const cache = getCachedWeatherData();
    const cachedData = cache[regionKey];

    if (cachedData && isCacheValid(cachedData.timestamp)) {
      // console.log(`캐시된 데이터 사용: ${regionKey}`);
      return cachedData.data;
    }

    return null;
  };

  // 모든 지역의 날씨 데이터를 한번에 가져오기 (캐시 우선)
  const fetchAllWeatherData = useCallback(async (regions: IfTbWeather[]) => {
    // 유효한 좌표를 가진 지역들만 필터링
    const validRegions = regions.filter(
      (region) => region.wt_lat !== undefined && region.wt_lng !== undefined
    );

    if (validRegions.length === 0) return;

    setIsLoading(true);
    // console.log(`총 지역 수: ${validRegions.length}`);

    try {
      const cache = getCachedWeatherData();
      const newWeatherData: { [key: string]: any } = {};
      const regionsToFetch: IfTbWeather[] = [];

      // 먼저 캐시에서 데이터 확인
      validRegions.forEach((region) => {
        const regionKey = getRegionKey(region);
        const cachedData = getCachedRegionData(regionKey);

        if (cachedData) {
          newWeatherData[regionKey] = cachedData;
        } else {
          regionsToFetch.push(region);
        }
      });

      // 캐시에 없는 지역들만 API 호출
      if (regionsToFetch.length > 0) {
        // console.log(`API 호출 필요한 지역 수: ${regionsToFetch.length}`);
        // map sequential promise
        const results: { regionKey: string; data: { pops: any[]; resultMsg: string } }[] = [];
        for (const region of regionsToFetch) {
          const regionKey = getRegionKey(region);
          // console.log(`API 호출 시작: ${region.wt_rgn_nm} (${regionKey})`);
          const data = await fetchWeatherData(region.wt_lat || 0, region.wt_lng || 0);
          useWeatherResionStore.getState().setCurrentRegionName(region.wt_rgn_nm || '');
          // console.log(`API 호출 완료: ${region.wt_rgn_nm} (${regionKey})`);
          results.push({ regionKey, data });
        }

        // const promises = regionsToFetch.map(async (region) => {
        //   const regionKey = getRegionKey(region);
        //   // console.log(`API 호출 시작: ${region.wt_rgn_nm} (${regionKey})`);
        //   const data = await fetchWeatherData(region.wt_lat || 0, region.wt_lng || 0);
        //   // console.log(`API 호출 완료: ${region.wt_rgn_nm} (${regionKey})`);
        //   return { regionKey, data };
        // });

        //const results = await Promise.all(promises);

        // if (results.some((result) => result.data.resultMsg === 'ERROR')) {
        //   throw new Error('날씨 데이터 로드 중 오류가 발생했습니다.');
        // }

        // 새로운 데이터를 캐시에 저장
        const updatedCache = { ...cache };
        results
          .filter((result) => result.data.resultMsg !== 'ERROR')
          .forEach(({ regionKey, data }) => {
            newWeatherData[regionKey] = data;
            updatedCache[regionKey] = {
              data,
              timestamp: Date.now(),
            };
          });

        setCachedWeatherData(updatedCache);
        if (results.some((result) => result.data.resultMsg === 'ERROR')) {
          throw new Error('날씨 데이터 로드 중 오류가 발생했습니다.');
        }
      } else {
        console.log('모든 데이터가 캐시에서 로드됨');
      }

      setWeatherData(newWeatherData);
    } catch (error) {
      console.log('날씨 데이터 로드 중 오류:', error);
      throw error; // 에러를 전달
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 특정 지역의 날씨 데이터 가져오기
  const getWeatherData = useCallback(
    (region: IfTbWeather) => {
      const regionKey = getRegionKey(region);
      const regionData = weatherData[regionKey];

      if (!regionData) return undefined;

      return regionData;
    },
    [weatherData]
  );

  // 캐시 무효화
  const clearCache = useCallback(() => {
    try {
      localStorage.removeItem(CACHE_KEY);
      setWeatherData({});
      console.log('날씨 데이터 캐시가 삭제되었습니다.');
    } catch (error) {
      console.warn('캐시 삭제 실패:', error);
    }
  }, []);

  // 캐시 상태 확인
  const getCacheStatus = useCallback(() => {
    const cache = getCachedWeatherData();
    const validEntries = Object.entries(cache).filter(([_, cachedData]) =>
      isCacheValid(cachedData.timestamp)
    );

    return {
      totalEntries: Object.keys(cache).length,
      validEntries: validEntries.length,
      expiredEntries: Object.keys(cache).length - validEntries.length,
      oldestEntry:
        validEntries.length > 0
          ? Math.min(...validEntries.map(([_, data]) => data.timestamp))
          : null,
      newestEntry:
        validEntries.length > 0
          ? Math.max(...validEntries.map(([_, data]) => data.timestamp))
          : null,
    };
  }, []);

  return {
    fetchAllWeatherData,
    getWeatherData,
    isLoading,
    clearCache,
    getCacheStatus,
  };
};

export default useWeatherMulti;
