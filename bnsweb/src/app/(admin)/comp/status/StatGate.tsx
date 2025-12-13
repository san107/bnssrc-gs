import { Box } from '@mui/material';
import { useMemo } from 'react';
import useSWR from 'swr';
import { IfTbGate } from '@/models/gate/tb_gate';
import * as gateutils from '@/utils/gate-utils';

const StatGate = () => {
  const { data: gateList } = useSWR<IfTbGate[]>(['/api/gate/list']);

  // 열림 카운트
  const countUp = useMemo(() => {
    return gateList?.filter((item) => item.gate_stat === 'UpOk' || item.gate_stat === 'UpLock')
      .length;
  }, [gateList]);

  // 닫힘 카운트
  const countDown = useMemo(() => {
    return gateList?.filter((item) => item.gate_stat === 'DownOk').length;
  }, [gateList]);

  // 정지 카운트
  const countStop = useMemo(() => {
    return gateList?.filter((item) => item.gate_stat === 'Stop').length;
  }, [gateList]);

  // 기타 카운트
  const countEtc = useMemo(() => {
    return gateList?.filter((item) => !item.gate_stat || item.gate_stat === 'Na').length;
  }, [gateList]);

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
          bgcolor: gateutils.gateStatColor('UpOk'),
          opacity: 0.9,
        }}
      >
        <div style={{ color: 'white', fontSize: '18px', padding: '5px' }}>열림</div>
        <div className='status-count'>{countUp}</div>
      </Box>
      <Box sx={{ marginTop: '3px' }} />
      <Box
        sx={{
          width: 110,
          height: 80,
          borderRadius: 1,
          bgcolor: gateutils.gateStatColor('DownOk'),
          opacity: 0.9,
        }}
      >
        <div style={{ color: 'white', fontSize: '18px', padding: '5px' }}>닫힘</div>
        <div className='status-count'>{countDown}</div>
      </Box>
      <Box sx={{ marginTop: '3px' }} />
      <Box
        sx={{
          width: 110,
          height: 80,
          borderRadius: 1,
          bgcolor: gateutils.gateStatColor('Stop'),
          opacity: 0.9,
        }}
      >
        <div style={{ color: 'white', fontSize: '18px', padding: '5px' }}>정지</div>
        <div className='status-count'>{countStop}</div>
      </Box>
      <Box sx={{ marginTop: '3px' }} />
      <Box
        sx={{
          width: 110,
          height: 80,
          borderRadius: 1,
          bgcolor: gateutils.gateStatColor(''),
          opacity: 0.9,
        }}
      >
        <div style={{ color: 'white', fontSize: '18px', padding: '5px' }}>기타</div>
        <div className='status-count'>{countEtc}</div>
      </Box>
    </Box>
  );
};

export default StatGate;
