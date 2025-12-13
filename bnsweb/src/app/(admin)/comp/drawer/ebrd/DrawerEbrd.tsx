'use client';

import { useDrawerStore } from '@/app/(admin)/comp/drawer/useDrawerStore';
import { usePromise } from '@/hooks/usePromise';
import { useRefComponent } from '@/hooks/useRefComponent';
import { IfTbEbrd } from '@/models/ebrd/tb_ebrd';
import { useMobile } from '@/hooks/useMobile';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Drawer from '@mui/material/Drawer';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { create } from 'zustand';
import React, { useEffect, useState } from 'react';
import SvgIcon from '@mui/material/SvgIcon';
import { PiNetwork, PiNetworkSlash } from 'react-icons/pi';
import { strToTime } from '@/utils/weather-utils';
import * as ebrdutils from '@/utils/ebrd-utils';
import { CdIdLabel } from '@/app/(admin)/comp/input/CdIdLabel';
import { CameraViewer } from '@/app/(admin)/comp/display/CameraViewer';
import { BtnCameraExpand } from '@/app/(admin)/comp/drawer/BtnCameraExpand';

const leftMenuWidth = 0;
const drawerWidth = 360;

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
  background: '#edf2fa',
}));

const InfoSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  '& .section-title': {
    color: theme.palette.primary.main,
    fontWeight: 600,
    marginBottom: theme.spacing(1.5),
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  '& .info-content': {
    paddingLeft: theme.spacing(2),
    '& .info-item': {
      display: 'flex',
      alignItems: 'center',
      marginBottom: theme.spacing(1),
      '& .label': {
        color: theme.palette.text.secondary,
        minWidth: '100px',
        marginRight: theme.spacing(2),
      },
      '& .value': {
        color: theme.palette.text.primary,
        fontWeight: 500,
      },
    },
  },
}));

type Props = {
  open: (data: IfTbEbrd) => Promise<any>;
  isOpened: boolean;
};

export const DrawerEbrd = React.forwardRef<Props, unknown>((props, ref) => {
  const [open, setOpen] = useState(false);
  const promise = usePromise<any, any>();
  const [param, setParam] = useState<IfTbEbrd | null>(null);
  const { drawerType, setDrawerType } = useDrawerStore();
  const { isMobile } = useMobile();

  useEffect(() => {
    if (!open) return;
    setDrawerType('ebrd');
  }, [open, setDrawerType]);

  useEffect(() => {
    if (drawerType === 'ebrd') return;
    setOpen(false);
  }, [drawerType]);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  React.useImperativeHandle<Props, Props>(
    ref,
    (): Props => ({
      open: (data) => {
        return new Promise((resolve, reject) => {
          promise.current.resolve = resolve;
          promise.current.reject = reject;
          setParam(data);
          handleDrawerOpen();
        });
      },
      isOpened: open,
    })
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer
        transitionDuration={0}
        sx={{
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: isMobile ? '100%' : drawerWidth,
            boxSizing: 'border-box',
            position: 'absolute',
            marginLeft: leftMenuWidth,
            // 모바일에서 가로 드래그만 방지 (세로 스크롤은 허용)
            touchAction: 'pan-y',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none',
          },
        }}
        variant='persistent'
        // variant='permanent'
        anchor='left'
        open={open}
      >
        <DrawerHeader sx={{ display: 'flex' }}>
          <InfoIcon color='primary' />
          <div style={{ marginRight: 'auto', paddingLeft: '10px' }}>
            <Typography variant='h5'>전광판 정보</Typography>
          </div>
          <div>
            <IconButton onClick={handleDrawerClose}>
              <CloseIcon />
            </IconButton>
          </div>
        </DrawerHeader>
        <Divider />
        <Box sx={{ display: 'flex', padding: 1 }}>
          <Box>
            <Typography variant='h6'>{param?.ebrd_nm}</Typography>
          </Box>
          <Box flexGrow={1} />
          {param?.comm_stat && (
            <Box
              sx={{
                color: 'white',
                padding: '5px 16px',
                borderRadius: '20px',
                textAlign: 'center',
                minWidth: '93px',
                backgroundColor: ebrdutils.ebrdStatColor(param?.comm_stat),
              }}
            >
              <SvgIcon>{param?.comm_stat === 'Ok' ? <PiNetwork /> : <PiNetworkSlash />}</SvgIcon>
              &nbsp;
              <CdIdLabel grp='CS' id={param?.comm_stat} />
            </Box>
          )}
        </Box>
        <Divider />
        {param?.cam_seq && !isMobile && (
          <>
            <Box position={'relative'}>
              <CameraViewer width={'100%'} minHeight={270} cam_seq={param?.cam_seq} />
              <BtnCameraExpand camSeq={param?.cam_seq} />
            </Box>
            <Divider />
          </>
        )}
        <InfoSection>
          <Typography variant='subtitle1' className='section-title'>
            <InfoIcon fontSize='small' />
            기본 정보
          </Typography>
          <Box className='info-content'>
            <Box className='info-item'>
              <Typography variant='body2' className='label'>
                전광판 ID
              </Typography>
              <Typography variant='body2' className='value'>
                {param?.ebrd_id}
              </Typography>
            </Box>
            <Box className='info-item'>
              <Typography variant='body2' className='label'>
                위치
              </Typography>
              <Typography variant='body2' className='value'>
                {param?.ebrd_lat}, {param?.ebrd_lng}
              </Typography>
            </Box>
            <Box className='info-item'>
              <Typography variant='body2' className='label'>
                IP/Port
              </Typography>
              <Typography variant='body2' className='value'>
                {param?.ebrd_ip}:{param?.ebrd_port}
              </Typography>
            </Box>
            <Box className='info-item'>
              <Typography variant='body2' className='label'>
                크기
              </Typography>
              <Typography variant='body2' className='value'>
                {param?.ebrd_size_w} x {param?.ebrd_size_h}
              </Typography>
            </Box>
          </Box>
        </InfoSection>
        <Divider />

        <InfoSection>
          <Typography variant='subtitle1' className='section-title'>
            <MonitorHeartIcon fontSize='small' />
            상태 정보
          </Typography>
          <Box className='info-content'>
            <Box className='info-item'>
              <Typography variant='body2' className='label'>
                통신 상태
              </Typography>
              <Typography
                variant='body2'
                className='value'
                sx={{
                  color:
                    param?.comm_stat === 'Ok'
                      ? 'success.main'
                      : param?.comm_stat === 'Err'
                      ? 'error.main'
                      : 'text.secondary',
                }}
              >
                {param?.comm_stat === 'Ok' ? '정상' : param?.comm_stat === 'Err' ? '장애' : 'N/A'}
              </Typography>
            </Box>
            <Box className='info-item'>
              <Typography variant='body2' className='label'>
                전광판 타입
              </Typography>
              <Typography variant='body2' className='value'>
                {param?.ebrd_type}
              </Typography>
            </Box>
            <Box className='info-item'>
              <Typography variant='body2' className='label'>
                휘도 단계
              </Typography>
              <Typography variant='body2' className='value'>
                주간 {param?.brght_day_lvl} / 야간 {param?.brght_night_lvl}
              </Typography>
            </Box>
            {param?.ebrd_event === 'EMER_START' && (
              <Box className='info-item'>
                <Typography variant='body2' className='label'>
                  이벤트
                </Typography>
                <Typography variant='body2' className='value'>
                  긴급
                </Typography>
              </Box>
            )}
            <Box className='info-item'>
              <Typography variant='body2' className='label'>
                날씨 표출정보
              </Typography>
              <Typography variant='body2' className='value'>
                {param?.ebrd_weather_msg}
              </Typography>
            </Box>
          </Box>
        </InfoSection>
        <Divider />

        <InfoSection>
          <Typography variant='subtitle1' className='section-title'>
            <AccessTimeIcon fontSize='small' />
            시간 설정
          </Typography>
          <Box className='info-content'>
            <Box className='info-item'>
              <Typography variant='body2' className='label'>
                주간 시간
              </Typography>
              <Typography variant='body2' className='value'>
                {param?.day_time_start && param?.day_time_end
                  ? `${strToTime(param.day_time_start)} ~ ${strToTime(param.day_time_end)}`
                  : '-'}
              </Typography>
            </Box>
            <Box className='info-item'>
              <Typography variant='body2' className='label'>
                전광판 On
              </Typography>
              <Typography variant='body2' className='value'>
                {param?.on_time_start && param?.on_time_end
                  ? `${strToTime(param.on_time_start)} ~ ${strToTime(param.on_time_end)}`
                  : '-'}
              </Typography>
            </Box>
            <Box className='info-item'>
              <Typography variant='body2' className='label'>
                전광판 Off
              </Typography>
              <Typography variant='body2' className='value'>
                {param?.on_time_end && param?.on_time_start
                  ? `${strToTime(param.on_time_end)} ~ ${strToTime(param.on_time_start)}`
                  : '-'}
              </Typography>
            </Box>
          </Box>
        </InfoSection>
      </Drawer>
    </Box>
  );
});

DrawerEbrd.displayName = 'DrawerEbrd';
export const useDrawerEbrd = () => useRefComponent<Props>(DrawerEbrd);

export const useDrawerEbrdStore = create<{
  setRef: (v: React.RefObject<Props | null> | null) => void;
  ref: React.RefObject<Props | null> | null;
}>((set) => ({
  setRef: (v: React.RefObject<Props | null> | null) => set({ ref: v }),
  ref: null,
}));
