// @flow
import { IfTbWater } from '@/models/water/tb_water';
import { Box } from '@mui/material';
import clsx from 'clsx';
import { IfTbWaterHist } from '@/models/water/tb_water_hist';
import useSWR from 'swr';
import { useEffect } from 'react';
import { useWaterLevelRefresh } from '@/hooks/useWaterLevelRefresh';

type Props = {
  water: IfTbWater;
  theme?: 'light' | 'dark';
};

export const WaterLevel = ({ water, theme = 'dark' }: Props) => {
  const { data: list, mutate: mutateWaterHist } = useSWR<IfTbWaterHist[]>(
    water.water_dev_id && [
      '/api/water_hist/list',
      { waterDevId: water.water_dev_id, limit: 1, limitHour: 1 },
    ]
  );
  const { refreshTrigger, maxLevel } = useWaterLevelRefresh();

  useEffect(() => {
    mutateWaterHist();
  }, [refreshTrigger, mutateWaterHist]);

  const currentWater =
    list && list.length > 0 ? { ...water, water_level: list[0].water_level } : water;

  const levels = [
    { lvl: 'crit', cls: 'bg-red-500', txt: '심각' },
    { lvl: 'alert', cls: 'bg-orange-500', txt: '경계' },
    { lvl: 'warn', cls: 'bg-amber-500', txt: '주의' },
    { lvl: 'attn', cls: 'bg-blue-500', txt: '관심' },
    { lvl: 'safe', cls: 'bg-green-500', txt: '안전' },
  ];
  const minHeight = 55;
  const getWaterLevelRate = (): number => {
    // 퍼센트로 리턴함.
    const lvl = currentWater.water_level;
    if (
      !lvl ||
      !currentWater.limit_alert ||
      !currentWater.limit_crit ||
      !currentWater.limit_warn ||
      !currentWater.limit_attn
    )
      return 0;
    if (lvl > currentWater.limit_crit * 2 - currentWater.limit_alert) {
      return 100;
    }

    if (lvl >= currentWater.limit_crit) {
      const gap = currentWater.limit_crit - currentWater.limit_alert;
      return 80 + ((lvl - currentWater.limit_crit) / gap) * 20;
    }
    if (lvl >= currentWater.limit_alert) {
      const gap = currentWater.limit_crit - currentWater.limit_alert;
      return 60 + ((lvl - currentWater.limit_alert) / gap) * 20;
    }
    if (lvl >= currentWater.limit_warn) {
      const gap = currentWater.limit_alert - currentWater.limit_warn;
      return 40 + ((lvl - currentWater.limit_warn) / gap) * 20;
    }
    if (lvl >= currentWater.limit_attn) {
      const gap = currentWater.limit_warn - currentWater.limit_attn;
      return 20 + ((lvl - currentWater.limit_attn) / gap) * 20;
    }
    return (lvl / currentWater.limit_attn) * 20;
  };
  const getLevelIndex = (rate) => {
    if (rate >= 80) return 0;
    if (rate >= 60) return 1;
    if (rate >= 40) return 2;
    if (rate >= 20) return 3;
    return 4;
  };
  const getLevelInfo = (rate) => {
    const idx = getLevelIndex(rate);
    return levels[idx];
  };
  const rate = getWaterLevelRate();
  const info = getLevelInfo(rate);

  return (
    <Box className='px-2 py-0' sx={{ display: 'flex' }}>
      <Box className='p-3 ' sx={{ display: 'flex', flexDirection: 'column', width: 120 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            width: '100%',
            border: '1px solid #3d3f51',
            borderRadius: '4px',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            background: 'linear-gradient(180deg, rgba(61,63,81,0.1) 0%, rgba(61,63,81,0.05) 100%)',
          }}
        >
          <Box flexGrow={1}></Box>
          {/* {rate < 40 ? (
            <Box
              sx={{
                textAlign: 'center',
                color: '#d4d5d9',
                padding: '4px',
                background: 'rgba(0,0,0,0.1)',
                backdropFilter: 'blur(4px)',
              }}
            >
              현재수위
              <br />
              {currentWater.water_level === null || currentWater.water_level == undefined
                ? ''
                : `(${currentWater.water_level} m)`}
              <br />
              {info.txt}
            </Box>
          ) : null} */}
          <Box
            className={clsx('text-white p-1 text-center flex items-center opacity-90', info.cls)}
            // height={rate.toFixed(0) + '%'}
            height={`${((currentWater?.water_level || 0) / maxLevel) * 260}px`}
            sx={{
              transition: 'all 0.3s ease',
              background: `linear-gradient(180deg, ${info.cls.replace(
                'bg-',
                ''
              )} 0%, ${info.cls.replace('bg-', '')}dd 100%)`,
              boxShadow: '0 0 15px rgba(0,0,0,0.2)',
              backdropFilter: 'blur(4px)',
              position: 'relative',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-end',
              paddingBottom: '8px',
            }}
          >
            {/* {rate >= 40 ? ( */}
            <Box
              sx={{
                textAlign: 'center',
                color: theme === 'light' ? '#1a1a1a' : '#ffffff',
                textShadow:
                  theme === 'light'
                    ? '0 1px 2px rgba(255,255,255,0.8), 0 0 4px rgba(0,0,0,0.3)'
                    : '0 1px 2px rgba(0,0,0,0.3)',
                fontWeight: 500,
                position: 'absolute',
                bottom: '8px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '100%',
              }}
            >
              현재수위
              <br />
              {currentWater.water_level === null || currentWater.water_level == undefined
                ? ''
                : `(${currentWater.water_level} m)`}
              <br />
              {info.txt}
            </Box>
            {/* ) : null} */}
          </Box>
        </Box>
      </Box>
      <Box className='p-2' sx={{ display: 'flex', flexDirection: 'column', width: 120 }}>
        <Box
          className='bg-red-500 text-white p-1 text-center opacity-90'
          minHeight={minHeight}
          sx={{
            borderRadius: '4px',
            marginBottom: '2px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            background: 'linear-gradient(180deg, #ef4444 0%, #dc2626 100%)',
            fontSize: '14px',
          }}
        >
          심각
          <br />
          {currentWater.limit_crit === undefined ? '' : `(${currentWater.limit_crit}~m)`}
        </Box>
        <Box
          className='bg-orange-500 text-white p-1 text-center opacity-90'
          minHeight={minHeight}
          sx={{
            borderRadius: '4px',
            marginBottom: '2px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            background: 'linear-gradient(180deg, #f97316 0%, #ea580c 100%)',
            fontSize: '14px',
          }}
        >
          경계
          <br />
          {currentWater.limit_crit === undefined ? '' : `(~${currentWater.limit_crit}m)`}
        </Box>
        <Box
          className='bg-yellow-500 text-white p-1 text-center opacity-90'
          minHeight={minHeight}
          sx={{
            borderRadius: '4px',
            marginBottom: '2px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            background: 'linear-gradient(180deg, #eab308 0%, #ca8a04 100%)',
            fontSize: '14px',
          }}
        >
          주의
          <br />
          {currentWater.limit_alert === undefined ? '' : `(~${currentWater.limit_alert}m)`}
        </Box>
        <Box
          className='bg-blue-500 text-white p-1 text-center opacity-90'
          minHeight={minHeight}
          sx={{
            borderRadius: '4px',
            marginBottom: '2px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            background: 'linear-gradient(180deg, #3b82f6 0%, #2563eb 100%)',
            fontSize: '14px',
          }}
        >
          관심
          <br />
          {currentWater.limit_warn === undefined ? '' : `(~${currentWater.limit_warn}m)`}
        </Box>
        <Box
          className='bg-green-500 text-white p-1 text-center opacity-90'
          minHeight={minHeight}
          sx={{
            borderRadius: '4px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            background: 'linear-gradient(180deg, #22c55e 0%, #16a34a 100%)',
            fontSize: '14px',
          }}
        >
          안전
          <br />
          {currentWater.limit_attn === undefined ? '' : `(~${currentWater.limit_attn}m)`}
        </Box>
      </Box>
    </Box>
  );
};
