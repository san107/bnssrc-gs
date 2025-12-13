import axios from 'axios';
import { IfTbWater } from '@/models/water/tb_water';

export const statColor = (stat: IfTbWater['comm_stat']) => {
  if (stat === 'Ok') {
    return '#429e22';
  } else if (stat === 'Err') {
    return '#cc4655';
  }
  return '#9f9898';
};

export const getWaterIcon = (water: IfTbWater) => {
  if (water.comm_stat !== 'Ok') {
    //return '/images/water_icon_na.png';
    return '/images/water_icon_step5.png';
  }
  const w = water;
  if (w.water_stat === 'Unknown') return '/images/water_icon_na.png';
  if (w.water_stat === 'Norm') return '/images/water_icon_step1.png';
  if (w.water_stat === 'Attn') return '/images/water_icon_step2.png';
  if (w.water_stat === 'Warn') return '/images/water_icon_step3.png';
  if (w.water_stat === 'Alert') return '/images/water_icon_step4.png';
  if (w.water_stat === 'Crit') return '/images/water_icon_step5.png';
  return '/images/water_icon_na.png';
};

export const getWaterStat = (water: IfTbWater) => {
  if (water.comm_stat !== 'Ok') {
    return '장애';
  }
  const w = water;
  if (w.water_stat === 'Unknown') return 'N/A';
  if (w.water_stat === 'Norm') return '안전';
  if (w.water_stat === 'Attn') return '관심';
  if (w.water_stat === 'Warn') return '주의';
  if (w.water_stat === 'Alert') return '경계';
  if (w.water_stat === 'Crit') return '심각';
  return 'N/A';
};

export const getWaterStatColor = (water: IfTbWater) => {
  if (water.comm_stat !== 'Ok') {
    //return '#ff0000';
    return '#ef4444';
  }
  const w = water;
  if (w.water_stat === 'Unknown') return '#c0504d';
  if (w.water_stat === 'Norm') return '#22c55e';
  if (w.water_stat === 'Attn') return '#3b82f6';
  if (w.water_stat === 'Warn') return '#f59e0b';
  if (w.water_stat === 'Alert') return '#f97316';
  if (w.water_stat === 'Crit') return '#ef4444';
  return '#9f9898';
};

export const waterLevelText = (level: IfTbWater['water_stat']) => {
  if (level === 'Norm') {
    return '정상';
  } else if (level === 'Attn') {
    return '관심';
  } else if (level === 'Warn') {
    return '주의';
  } else if (level === 'Alert') {
    return '경계';
  } else if (level === 'Crit') {
    return '심각';
  } else if (level === 'Unknown') {
    return 'N/A';
  } else {
    return '장애';
  }
};

export const waterLevelColor = (level: IfTbWater['water_stat'] | IfTbWater['comm_stat']) => {
  if (level === 'Err') return '#ef4444';
  if (level === 'Norm') {
    return '#22c55e';
  } else if (level === 'Attn') {
    return '#3b82f6';
  } else if (level === 'Warn') {
    return '#f59e0b';
  } else if (level === 'Alert') {
    return '#f97316';
  } else if (level === 'Crit') {
    return '#ef4444';
  } else if (level === 'Unknown') {
    return '#c0504d';
  } else {
    return '#9f9898';
  }
};

// 워터 레벨 체크하여 상태 가져오기
export const calcStatWaterLevel = (
  attn: number,
  warn: number,
  alert: number,
  crit: number,
  level: number
): IfTbWater['water_stat'] => {
  if (level <= attn) {
    return 'Norm'; // 정상
  } else if (level > attn && level <= warn) {
    return 'Attn'; // 관심
  } else if (level > warn && level <= alert) {
    return 'Warn'; // 주의
  } else if (level > alert && level <= crit) {
    return 'Alert'; // 경계
  } else if (level > crit) {
    return 'Crit'; // 심각
  }
};

// 수위계 현재 상태 가져오기
export const devWaterStat = async (row: IfTbWater) => {
  const currStat = await axios
    .get(`/api/water_hist/devone?waterDevId=${row?.water_dev_id}`)
    .then((res) => {
      //   console.log('water_level', res.data[0]?.water_level);
      if (res.data[0]?.water_level) {
        return [
          calcStatWaterLevel(
            row.limit_attn || 0,
            row.limit_warn || 0,
            row.limit_alert || 0,
            row.limit_crit || 0,
            res.data[0]?.water_level
          ),
          res.data[0]?.water_level,
        ];
      }
    });
  //   console.log('currStat', currStat);
  return currStat;
};
