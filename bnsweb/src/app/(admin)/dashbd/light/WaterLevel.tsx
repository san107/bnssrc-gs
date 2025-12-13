// @flow
import { IfTbWater } from '@/models/water/tb_water';
import { Box } from '@mui/material';
import clsx from 'clsx';
type Props = {
  water: IfTbWater;
};

export const WaterLevel = ({ water }: Props) => {
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
    const lvl = water.water_level;
    if (!lvl || !water.limit_alert || !water.limit_crit || !water.limit_warn || !water.limit_attn)
      return 0;
    if (lvl > water.limit_crit * 2 - water.limit_alert) {
      return 100;
    }

    if (lvl >= water.limit_crit) {
      const gap = water.limit_crit - water.limit_alert;
      return 80 + ((lvl - water.limit_crit) / gap) * 20;
    }
    if (lvl >= water.limit_alert) {
      const gap = water.limit_crit - water.limit_alert;
      return 60 + ((lvl - water.limit_alert) / gap) * 20;
    }
    if (lvl >= water.limit_warn) {
      const gap = water.limit_alert - water.limit_warn;
      return 40 + ((lvl - water.limit_warn) / gap) * 20;
    }
    if (lvl >= water.limit_attn) {
      const gap = water.limit_warn - water.limit_attn;
      return 20 + ((lvl - water.limit_attn) / gap) * 20;
    }
    //if (lvl < water.limit_attn) {
    return (lvl / water.limit_attn) * 20;
    //}
  };
  const getLevelIndex = (rate) => {
    //
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
  //console.log('rate', rate, 'info', info);
  return (
    <Box className='px-2 py-0' sx={{ display: 'flex' }}>
      <Box className='p-3 ' sx={{ display: 'flex', flexDirection: 'column', width: 120 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            width: '100%',
            border: '1px solid #ccc',
          }}
        >
          <Box flexGrow={1}></Box>
          {rate < 40 ? (
            <Box sx={{ textAlign: 'center' }}>
              현재수위
              <br />
              {water.water_level === null || water.water_level == undefined
                ? ''
                : `(${water.water_level} m)`}
              {info.txt}
            </Box>
          ) : null}
          <Box
            className={clsx('text-white p-1 text-center flex items-center opacity-90', info.cls)}
            height={rate.toFixed(0) + '%'}
          >
            {rate >= 40 ? (
              <Box sx={{ textAlign: 'center' }}>
                현재수위
                <br />
                {water.water_level === null || water.water_level == undefined
                  ? ''
                  : `(${water.water_level} m)`}
                {info.txt}
              </Box>
            ) : null}
          </Box>
        </Box>
      </Box>
      <Box className='p-3' sx={{ display: 'flex', flexDirection: 'column', width: 120 }}>
        <Box className='bg-red-500 text-white p-1 text-center opacity-90' minHeight={minHeight}>
          심각{water.limit_crit === undefined ? '' : `(${water.limit_crit}~m)`}
        </Box>
        <Box className='bg-orange-500 text-white p-1 text-center opacity-90' minHeight={minHeight}>
          경계{water.limit_crit === undefined ? '' : `(~${water.limit_crit}m)`}
        </Box>
        <Box className='bg-yellow-500 text-white p-1 text-center opacity-90' minHeight={minHeight}>
          주의{water.limit_alert === undefined ? '' : `(~${water.limit_alert}m)`}
        </Box>
        <Box className='bg-blue-500 text-white p-1 text-center opacity-90' minHeight={minHeight}>
          관심{water.limit_warn === undefined ? '' : `(~${water.limit_warn}m)`}
        </Box>
        <Box className='bg-green-500 text-white p-1 text-center opacity-90' minHeight={minHeight}>
          안전{water.limit_attn === undefined ? '' : `(~${water.limit_attn}m)`}
        </Box>
      </Box>
    </Box>
  );
};
