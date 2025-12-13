import { BoomGate } from '@/app/icons/BoomGate';
import { Box, Chip, Stack, SvgIcon } from '@mui/material';
import { useMemo } from 'react';
import { useGateList } from '@/hooks/useDevList';

const WorkGate = () => {
  const { data: gateList } = useGateList();

  // All 카운트
  const countAll: number = useMemo(() => {
    return gateList?.length === undefined ? 0 : gateList.length;
  }, [gateList]);

  // Warning 카운트
  const countWarn: number = useMemo(() => {
    const count = gateList?.filter(
      (item) => item.gate_stat === null || item.gate_stat === 'Na'
    ).length;
    return count === undefined ? 0 : count;
  }, [gateList]);

  return (
    <Box
      sx={{
        width: 380,
        height: 80,
        borderRadius: 1,
        bgcolor: 'white',
        opacity: 0.7,
      }}
    >
      <Stack direction='row' spacing={8} sx={{ padding: '10px' }}>
        <Box sx={{ padding: '0px' }}>
          <SvgIcon>
            <BoomGate />
          </SvgIcon>
        </Box>
        <Box sx={{ paddingTop: '3px' }}>
          <Chip label='전체' size='small' color='primary' />
          <Box
            sx={{
              color: '#7581c6',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: '50%',
              fontSize: '24px',
            }}
          >
            {countAll}
          </Box>
        </Box>
        <Box sx={{ paddingTop: '3px' }}>
          <Chip label='정상' size='small' color='success' />
          <Box
            sx={{
              color: '#69a06a',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: '50%',
              fontSize: '24px',
            }}
          >
            {countAll - countWarn}
          </Box>
        </Box>
        <Box sx={{ paddingTop: '3px' }}>
          <Chip label='오류' size='small' color='error' />
          <Box
            sx={{
              color: '#dd6968',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: '50%',
              fontSize: '24px',
            }}
          >
            {countWarn}
          </Box>
        </Box>
      </Stack>
    </Box>
  );
};

export default WorkGate;
