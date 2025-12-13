'use client';

import { CameraViewer } from '@/app/(admin)/comp/display/CameraViewer';
import { BtnCameraExpand } from '@/app/(admin)/comp/drawer/BtnCameraExpand';
import { EmcallGrpCtl } from '@/app/(admin)/comp/drawer/emcall/EmcallGrpCtl';
import { useDrawerStore } from '@/app/(admin)/comp/drawer/useDrawerStore';
import { CdIdLabel } from '@/app/(admin)/comp/input/CdIdLabel';
import { isEmcallEvt, useWsMsg } from '@/app/ws/useWsMsg';
import { useMobile } from '@/hooks/useMobile';
import { usePromise } from '@/hooks/usePromise';
import { useRefComponent } from '@/hooks/useRefComponent';
import { IfTbEmcallGrp } from '@/models/emcall/tb_emcall_grp';
import { TbCamera } from '@/models/tb_camera';
import * as emcallutils from '@/utils/emcall-utils';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import { Box } from '@mui/material';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import SvgIcon from '@mui/material/SvgIcon';
import Typography from '@mui/material/Typography';
import React, { useEffect, useState } from 'react';
import { PiNetwork, PiNetworkSlash } from 'react-icons/pi';
import useSWR from 'swr';
import { create } from 'zustand';

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

type Props = {
  open: (data: IfTbEmcallGrp) => Promise<any>;
  isOpened: boolean;
};

export const DrawerEmcallGrp = React.forwardRef<Props, unknown>((props, ref) => {
  const [open, setOpen] = useState(false);
  const promise = usePromise<any, any>();
  const [param, setParam] = useState<IfTbEmcallGrp | null>(null);
  const { drawerType, setDrawerType } = useDrawerStore();
  const { isMobile } = useMobile();

  const { data: dataCam } = useSWR<TbCamera>(
    open && param?.cam_seq ? [`/api/camera/one?camSeq=${param?.cam_seq}`] : null
  );

  useEffect(() => {
    if (!open) return;
    setDrawerType('emcallgrp');
  }, [open, setDrawerType]);

  useEffect(() => {
    if (drawerType === 'emcallgrp') return;
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

  useWsMsg((msg) => {
    if (!open) return; // 열려있지 않은 경우 skip
    if (isEmcallEvt(msg)) {
    }
  });

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
        anchor='left'
        open={open}
      >
        <DrawerHeader sx={{ display: 'flex' }}>
          <InfoIcon color='primary' />
          <div style={{ marginRight: 'auto', paddingLeft: '10px' }}>
            <Typography variant='h5'>송출그룹 정보</Typography>
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
            <Typography variant='h6'>
              {param?.emcall_grp_nm}
              <span style={{ fontSize: '0.9em' }}>({param?.emcall_grp_id})</span>
            </Typography>
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
                backgroundColor: emcallutils.emcallStatColor(param?.comm_stat),
              }}
            >
              <SvgIcon>{param?.comm_stat === 'Ok' ? <PiNetwork /> : <PiNetworkSlash />}</SvgIcon>
              &nbsp;
              <CdIdLabel grp='CS' id={param?.comm_stat} />
            </Box>
          )}
        </Box>
        <Divider />

        {/* 카메라 뷰 */}
        {param?.cam_seq && !isMobile && (
          <>
            <Box position={'relative'}>
              <CameraViewer width={'100%'} minHeight={270} cam_seq={param?.cam_seq} />
              <BtnCameraExpand data={dataCam} />
            </Box>
            <Divider />
          </>
        )}

        <EmcallGrpCtl grp_seq={param?.emcall_grp_seq} />
      </Drawer>
    </Box>
  );
});

DrawerEmcallGrp.displayName = 'DrawerEmcallGrp';
export const useDrawerEmcallGrp = () => useRefComponent<Props>(DrawerEmcallGrp);

export const useDrawerEmcallGrpStore = create<{
  setRef: (v: React.RefObject<Props | null> | null) => void;
  ref: React.RefObject<Props | null> | null;
}>((set) => ({
  setRef: (v: React.RefObject<Props | null> | null) => set({ ref: v }),
  ref: null,
}));
