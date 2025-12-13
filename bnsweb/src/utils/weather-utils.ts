import { IfWeather } from '@/models/weather';
import { useSysConfStore } from '@/store/useSysConf';

/*
 *   위도경도 좌표 변환
 */
const RE = 6371.00877; // 지구 반경(km)
const GRID = 5.0; // 격자 간격(km)
const SLAT1 = 30.0; // 투영 위도1(degree)
const SLAT2 = 60.0; // 투영 위도2(degree)
const OLON = 126.0; // 기준점 경도(degree)
const OLAT = 38.0; // 기준점 위도(degree)
const XO = 43; // 기준점 X좌표(GRID)
const YO = 136; // 기1준점 Y좌표(GRID)

// LCC DFS 좌표변환 ( code : "toXY"(위경도->좌표, v1:위도, v2:경도), "toLL"(좌표->위경도,v1:x, v2:y) )
export const dfs_xy_conv = (code: string, v1: number, v2: number) => {
  const DEGRAD = Math.PI / 180.0;
  const RADDEG = 180.0 / Math.PI;

  const re = RE / GRID;
  const slat1 = SLAT1 * DEGRAD;
  const slat2 = SLAT2 * DEGRAD;
  const olon = OLON * DEGRAD;
  const olat = OLAT * DEGRAD;

  let sn = Math.tan(Math.PI * 0.25 + slat2 * 0.5) / Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);
  let sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sf = (Math.pow(sf, sn) * Math.cos(slat1)) / sn;
  let ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
  ro = (re * sf) / Math.pow(ro, sn);
  const rs = { x: 0, y: 0 };
  if (code == 'toXY') {
    rs['lat'] = v1;
    rs['lng'] = v2;
    let ra = Math.tan(Math.PI * 0.25 + v1 * DEGRAD * 0.5);
    ra = (re * sf) / Math.pow(ra, sn);
    let theta = v2 * DEGRAD - olon;
    if (theta > Math.PI) theta -= 2.0 * Math.PI;
    if (theta < -Math.PI) theta += 2.0 * Math.PI;
    theta *= sn;
    rs['x'] = Math.floor(ra * Math.sin(theta) + XO + 0.5);
    rs['y'] = Math.floor(ro - ra * Math.cos(theta) + YO + 0.5);
  } else {
    rs['x'] = v1;
    rs['y'] = v2;
    const xn = v1 - XO;
    const yn = ro - v2 + YO;
    let ra = Math.sqrt(xn * xn + yn * yn);
    if (sn < 0.0) ra = -ra;
    let alat = Math.pow((re * sf) / ra, 1.0 / sn);
    alat = 2.0 * Math.atan(alat) - Math.PI * 0.5;

    let theta = 0.0;
    if (Math.abs(xn) <= 0.0) {
      theta = 0.0;
    } else {
      if (Math.abs(yn) <= 0.0) {
        theta = Math.PI * 0.5;
        if (xn < 0.0) theta = -theta;
      } else theta = Math.atan2(xn, yn);
    }
    const alon = theta / sn + olon;
    rs['lat'] = alat * RADDEG;
    rs['lng'] = alon * RADDEG;
  }
  return rs;
};

export const getYesterdayPopRate = (pops: IfWeather[]) => {
  const yesterday = getYesterday();
  const date = yesterday?.date;
  const pop = pops?.filter((item) => item?.category === 'POP' && item?.fcstDate === date);
  const sum = pop.reduce((acc, cur) => {
    return acc + Number(cur?.fcstValue);
  }, 0);
  // console.log('pop', pop);
  const popRate = sum === 0 ? 0 : sum / 12;
  return popRate.toFixed(1);
};

export const getTodayPopRate = (pops: IfWeather[]) => {
  const today = getToday();
  const date = today?.date;
  const pop = pops?.filter((item) => item?.category === 'POP' && item?.fcstDate === date);
  const sum = pop.reduce((acc, cur) => {
    return acc + Number(cur?.fcstValue);
  }, 0);
  const popRate = sum === 0 ? 0 : sum / 24;
  return popRate.toFixed(1);
};

export const getWeatherIcon = (pty: string, sky: string) => {
  if (pty === '없음') {
    if (sky === '맑음') {
      return '/images/w-sunny.png';
    } else if (sky === '구름많음') {
      return '/images/w-clouds.png';
    } else if (sky === '흐림') {
      return '/images/w-cloud.png';
    } else {
      return 'N/A';
    }
  } else if (pty === '비') {
    return '/images/w-rain.png';
  } else if (pty === '비/눈') {
    return '/images/w-rainsnow.png';
  } else if (pty === '눈') {
    return '/images/w-snow.png';
  } else if (pty === '소나기') {
    return '/images/w-rains.png';
  } else {
    return 'N/A';
  }
};

export const getWeatherIcon2 = (pty: number, sky: number) => {
  if (pty === 0) {
    if (sky === 1) {
      return '/images/w-sunny.png';
    } else if (sky === 3) {
      return '/images/w-clouds.png';
    } else if (sky === 4) {
      return '/images/w-cloud.png';
    } else {
      return 'N/A';
    }
  } else if (pty === 1) {
    return '/images/w-rain.png';
  } else if (pty === 2) {
    return '/images/w-rainsnow.png';
  } else if (pty === 3) {
    return '/images/w-snow.png';
  } else if (pty === 4) {
    return '/images/w-rains.png';
  } else {
    return 'N/A';
  }
};

export const getWeatherStat = (pty: number, sky: number) => {
  if (pty === 0) {
    if (sky === 1) {
      return '맑음';
    } else if (sky === 3) {
      return '구름많음';
    } else if (sky === 4) {
      return '흐림';
    } else {
      return 'N/A';
    }
  } else if (pty === 1) {
    return '비';
  } else if (pty === 2) {
    return '비/눈';
  } else if (pty === 3) {
    return '눈';
  } else if (pty === 4) {
    return '소나기';
  } else {
    return 'N/A';
  }
};

// 하늘 상태 -  기상청 단기예보 open Api 문서 참고
export const getSkyStat = (value: number) => {
  if (value === 1) {
    return '맑음';
  } else if (value === 3) {
    return '구름많음';
  } else if (value === 4) {
    return '흐림';
  } else {
    return 'N/A';
  }
};

export const getSkyIcon = (value: string) => {
  if (value === '맑음') {
    return '/images/w-sunny.png';
  } else if (value === '구름많음') {
    return '/images/w-clouds.png';
  } else if (value === '흐림') {
    return '/images/w-cloud.png';
  } else {
    return 'N/A';
  }
};

// 강수 형태 -  기상청 단기예보 open Api 문서 참고
export const getPtyStat = (value: number) => {
  if (value === 0) {
    return '없음';
  } else if (value === 1) {
    return '비';
  } else if (value === 2) {
    return '비/눈';
  } else if (value === 3) {
    return '눈';
  } else if (value === 4) {
    return '소나기';
  } else {
    return 'N/A';
  }
};

// 풍향 형태 -  기상청 단기예보 open Api 문서 참고
export const getVecStat = (value: number) => {
  if (value <= 45) {
    return 'N-NE';
  } else if (value > 45 && value <= 90) {
    return 'NE-E';
  } else if (value > 90 && value <= 135) {
    return 'E-SE';
  } else if (value > 135 && value <= 180) {
    return 'SE-S';
  } else if (value > 180 && value <= 225) {
    return 'S-SW';
  } else if (value > 225 && value <= 270) {
    return 'SW-W';
  } else if (value > 270 && value <= 315) {
    return 'W-NW';
  } else if (value > 315 && value <= 360) {
    return 'NW-N';
  } else {
    return 'N/A';
  }
};

const getDateStr = (d: Date): string => {
  const year = d.getFullYear();
  const month = ('0' + (d.getMonth() + 1)).slice(-2);
  const day = ('0' + d.getDate()).slice(-2);
  const date = year + '' + month + '' + day;
  return date;
};

// 어제 날짜와 시간을 가져오기
export const getYesterday = () => {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const baseDate = new Date(yesterday);
  // 6시 전이면, 이전날짜로 조회 필요함.
  if (baseDate.getHours() < 6) {
    baseDate.setDate(baseDate.getDate() - 1);
  }

  const date = getDateStr(yesterday);

  const hours = ('0' + yesterday.getHours()).slice(-2);
  // const minutes = ('0' + today.getMinutes()).slice(-2);
  // const time = hours + '' + minutes;
  const time = hours + '00';

  return { date: date, time: time, baseDate: getDateStr(baseDate) };
};

// 현재 날짜와 시간을 가져오기
export const getToday = () => {
  const today = new Date();
  const baseDate = new Date(today);
  // 6시 전이면, 이전날짜로 조회 필요함.
  if (baseDate.getHours() < 6) {
    baseDate.setDate(baseDate.getDate() - 1);
  }

  const date = getDateStr(today);

  const hours = ('0' + today.getHours()).slice(-2);
  // const minutes = ('0' + today.getMinutes()).slice(-2);
  // const time = hours + '' + minutes;
  const time = hours + '00';

  return { date: date, time: time, baseDate: getDateStr(baseDate) };
};

// 현재 날짜 시간 표시
export const displayClock = () => {
  const now = new Date();
  const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];
  const dayOfWeek = daysOfWeek[now.getDay()];
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');

  let ampm = 'AM';
  let displayHours = hours;

  if (hours >= 12) {
    ampm = 'PM';
    displayHours = hours % 12;
    if (displayHours === 0) {
      displayHours = 12;
    }
  }

  return `${year}-${month}-${day} (${dayOfWeek}) ${displayHours}:${minutes}:${seconds} ${ampm}`;
};

export const strToDatetime = (date: string, time: string) => {
  const strDate = date.substring(0, 4) + '-' + date.substring(4, 6) + '-' + date.substring(6);
  const strTime = time.substring(0, 2) + ':' + time.substring(2);
  return strDate + ' ' + strTime;
};

export const strToDate = (date: string) => {
  const strDate = date.substring(0, 4) + '-' + date.substring(4, 6) + '-' + date.substring(6);
  return strDate;
};

export const strToTime = (time: string) => {
  const strTime = time.substring(0, 2) + ':' + time.substring(2);
  return strTime;
};

// 기상청 API Key
export const getApiKey = () => {
  const conf = useSysConfStore.getState()?.sysConf;
  return conf?.api_key_weather || '';
  //return 'H0Culebpca%2BTtxzM8mTp7YD%2FxBMECqxylxyH9TODGrVAFqdPkhMb7RFnY48%2BbzRIxIlZcKtkIa8FwsFxCGkYYQ%3D%3D';
};
