'use client';

import { useDrawerStore } from '@/app/(admin)/comp/drawer/useDrawerStore';
import { CdIdLabel } from '@/app/(admin)/comp/input/CdIdLabel';
import { usePromise } from '@/hooks/usePromise';
import { useRefComponent } from '@/hooks/useRefComponent';
import { TbCamera } from '@/models/tb_camera';
import * as strutils from '@/utils/str-utils';
import CloseIcon from '@mui/icons-material/Close';
import { Box, Button, Divider, SvgIcon } from '@mui/material';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import React, { useEffect, useState } from 'react';
import { create } from 'zustand';
import { BtnCameraExpand } from '@/app/(admin)/comp/drawer/BtnCameraExpand';
import { useDlgCameraView } from '@/app/(admin)/comp/popup/DlgCameraView';
import InfoIcon from '@mui/icons-material/Info';
import { PiNetwork, PiNetworkSlash } from 'react-icons/pi';
import useSWR from 'swr';
import { isCameraStat, useWsMsg } from '@/app/ws/useWsMsg';
import { CameraViewer } from '@/app/(admin)/comp/display/CameraViewer';
import { useMobile } from '@/hooks/useMobile';
import { camerautils } from '@/utils/camera-utils';

const leftMenuWidth = 0;
const drawerWidth = 360;

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
  background: '#edf2fa',
}));

type Props = {
  open: (data: TbCamera) => Promise<any>;
  isOpened: boolean;
};

export const DrawerCamera = React.forwardRef<Props, unknown>((props, ref) => {
  const [open, setOpen] = useState(false);
  const promise = usePromise<any, any>();
  const [camSeq, setCamSeq] = useState<number | undefined>(undefined);
  const { data, mutate: mutateCamera } = useSWR(
    open && camSeq ? [`/api/camera/one?camSeq=${camSeq}`] : undefined
  );
  const { drawerType, setDrawerType } = useDrawerStore();
  const { isMobile } = useMobile();

  useEffect(() => {
    if (!open) return;
    setDrawerType('camera');
  }, [open, setDrawerType]);

  useEffect(() => {
    if (drawerType === 'camera') return;
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
          //setData(data);
          setCamSeq(data?.cam_seq);
          handleDrawerOpen();
        });
      },
      isOpened: open,
    })
  );

  useWsMsg((msg) => {
    if (!open) return;
    if (isCameraStat(msg)) {
      mutateCamera();
    }
  });

  const [refCameraView, DlgCameraView] = useDlgCameraView();
  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer
        transitionDuration={0} // 애니메이션 X
        sx={{
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: isMobile ? '100%' : drawerWidth,
            boxSizing: 'border-box',
            overflow: 'hidden', // 스크롤 막기
            position: 'absolute',
            marginLeft: leftMenuWidth,
          },
        }}
        variant='persistent'
        anchor='left'
        open={open}
      >
        <DrawerHeader sx={{ display: 'flex' }}>
          <InfoIcon color='primary' />
          <div style={{ marginRight: 'auto', paddingLeft: '10px' }}>
            <Typography variant='h5'>카메라 정보</Typography>
          </div>
          <div>
            <IconButton onClick={handleDrawerClose}>
              <CloseIcon />
            </IconButton>
          </div>
        </DrawerHeader>
        <Divider />
        <Box sx={{ display: 'flex', padding: 1, alignItems: 'center' }}>
          <Typography variant='h6'>{data?.cam_nm}</Typography>
          <Box flexGrow={1}></Box>
          {data?.cam_stat && (
            <Box
              sx={{
                color: 'white',
                padding: '5px 16px',
                borderRadius: '20px',
                textAlign: 'center',
                minWidth: '93px',
                backgroundColor: camerautils.statColor(data?.cam_stat),
              }}
            >
              <SvgIcon>{data?.cam_stat === 'Ok' ? <PiNetwork /> : <PiNetworkSlash />}</SvgIcon>
              &nbsp;
              <CdIdLabel grp='CS' id={data?.cam_stat} />
            </Box>
          )}
        </Box>
        <Divider />
        {data?.cam_seq && (
          <>
            <Box position={'relative'}>
              <CameraViewer width={'100%'} minHeight={270} cam_seq={data?.cam_seq} />
              <BtnCameraExpand camSeq={data?.cam_seq} />
            </Box>
            <Divider />
          </>
        )}
        <Box sx={{ display: 'flex', padding: 1 }}>
          <Typography variant='h6'>상세정보</Typography>
        </Box>
        <Divider />
        <table className='camera'>
          <colgroup>
            <col style={{ width: '40%' }} />
            <col style={{ width: '60%' }} />
          </colgroup>
          <thead>
            <tr>
              <th>항목</th>
              <th>정보</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>카메라 IP</td>
              <td>
                {data?.cam_ip}:{data?.cam_port}
              </td>
            </tr>
            <tr>
              <td>타입</td>
              <td>
                <CdIdLabel grp='CT' id={data?.cam_type} />
              </td>
            </tr>
            <tr>
              <td>위도</td>
              <td>{strutils.convLatLng(data?.cam_lat?.toString())}</td>
            </tr>
            <tr>
              <td>경도</td>
              <td>{strutils.convLatLng(data?.cam_lng?.toString())}</td>
            </tr>
          </tbody>
        </table>
        <Box sx={{ display: 'flex', padding: 1, justifyContent: 'center' }}>
          {data && data.cam_seq && (
            <Button
              variant='contained'
              onClick={() => {
                refCameraView.current?.show(data);
              }}
            >
              확대보기
            </Button>
          )}
        </Box>
      </Drawer>
      <DlgCameraView />
    </Box>
  );
});

DrawerCamera.displayName = 'DrawerCamera';
export const useDrawerCamera = () => useRefComponent<Props>(DrawerCamera);

export const useDrawerCameraStore = create<{
  setRef: (v: React.RefObject<Props | null> | null) => void;
  ref: React.RefObject<Props | null> | null;
}>((set) => ({
  setRef: (v: React.RefObject<Props | null> | null) => set({ ref: v }),
  ref: null,
}));
