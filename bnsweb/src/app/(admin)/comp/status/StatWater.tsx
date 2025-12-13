import { IfTbWater } from '@/models/water/tb_water';
import * as waterutils from '@/utils/water-utils';
import { Box } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import useSWR from 'swr';

const StatWater = () => {
  const { data: waterList } = useSWR<IfTbWater[]>(['/api/water/list']);

  const [normCount, setNormCount] = useState<number>(0);
  const [attnCount, setAttnCount] = useState<number>(0);
  const [warnCount, setWarnCount] = useState<number>(0);
  const [alertCount, setAlertCount] = useState<number>(0);
  const [critCount, setCritCount] = useState<number>(0);

  const initCount = () => {
    setNormCount(0);
    setAttnCount(0);
    setWarnCount(0);
    setNormCount(0);
    setAlertCount(0);
    setCritCount(0);
  };

  const setStatCount = useCallback((currStat: string | undefined) => {
    if (currStat === 'Norm') {
      setNormCount((normCount) => normCount + 1);
    }
    if (currStat === 'Attn') {
      setAttnCount((attnCount) => attnCount + 1);
    }
    if (currStat === 'Warn') {
      setWarnCount((warnCount) => warnCount + 1);
    }
    if (currStat === 'Alert') {
      setAlertCount((alertCount) => alertCount + 1);
    }
    if (currStat === 'Crit') {
      setCritCount((critCount) => critCount + 1);
    }
  }, []);

  useEffect(() => {
    initCount();
    waterList?.map((item: IfTbWater) => {
      setStatCount(item?.water_stat);
    });
  }, [waterList, setStatCount]);

  return (
    <Box
      sx={{
        width: 130,
        height: 80,
        borderRadius: 1,
        opacity: 0.7,
      }}
    >
      <Box sx={{ width: 30 }} />
      <Box
        sx={{
          width: 110,
          height: 80,
          borderRadius: 1,
          bgcolor: waterutils.waterLevelColor('Norm'),
          opacity: 0.9,
        }}
      >
        <div style={{ color: 'white', fontSize: '18px', padding: '5px' }}>정상</div>
        <div className='status-count'>{normCount}</div>
      </Box>
      <Box sx={{ marginTop: '3px' }} />
      <Box
        sx={{
          width: 110,
          height: 80,
          borderRadius: 1,
          bgcolor: waterutils.waterLevelColor('Attn'),
          opacity: 0.9,
        }}
      >
        <div style={{ color: 'white', fontSize: '18px', padding: '5px' }}>관심</div>
        <div className='status-count'>{attnCount}</div>
      </Box>
      <Box sx={{ marginTop: '3px' }} />
      <Box
        sx={{
          width: 110,
          height: 80,
          borderRadius: 1,
          bgcolor: waterutils.waterLevelColor('Warn'),
          opacity: 0.9,
        }}
      >
        <div style={{ color: 'white', fontSize: '18px', padding: '5px' }}>주의</div>
        <div className='status-count'>{warnCount}</div>
      </Box>
      <Box sx={{ marginTop: '3px' }} />
      <Box
        sx={{
          width: 110,
          height: 80,
          borderRadius: 1,
          bgcolor: waterutils.waterLevelColor('Alert'),
          opacity: 0.9,
        }}
      >
        <div style={{ color: 'white', fontSize: '18px', padding: '5px' }}>경계</div>
        <div className='status-count'>{alertCount}</div>
      </Box>
      <Box sx={{ marginTop: '3px' }} />
      <Box
        sx={{
          width: 110,
          height: 80,
          borderRadius: 1,
          bgcolor: waterutils.waterLevelColor('Crit'),
          opacity: 0.9,
        }}
      >
        <div style={{ color: 'white', fontSize: '18px', padding: '5px' }}>심각</div>
        <div className='status-count'>{critCount}</div>
      </Box>
    </Box>
  );
};

export default StatWater;
