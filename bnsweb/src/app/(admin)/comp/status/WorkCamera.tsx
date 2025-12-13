import { Box, Chip, Stack, SvgIcon } from '@mui/material';
import { useMemo } from 'react';
import { GiCctvCamera } from 'react-icons/gi';
import { useCameraList } from '@/hooks/useDevList';

const WorkCamera = () => {
  const { data: cameraList } = useCameraList();

  // All 카운트
  const countAll: number = useMemo(() => {
    return cameraList?.length === undefined ? 0 : cameraList.length;
  }, [cameraList]);

  // Warning 카운트
  // 작동 안하면?
  const countWarn: number = useMemo(() => {
    return (cameraList || []).filter((ele) => ele.cam_stat == 'Err').length;
  }, [cameraList]);

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
            <GiCctvCamera />
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

export default WorkCamera;
