'use client';

import { useDrawerCameraList } from '@/app/(admin)/comp/drawer/DrawerCameraList';
import { useDrawerGateList } from '@/app/(admin)/comp/drawer/DrawerGateList';
import { useDrawerWaterList } from '@/app/(admin)/comp/drawer/DrawerWaterList';
import { useDrawerEmcallList } from '@/app/(admin)/comp/drawer/emcall/DrawerEmcallList';
import { useDrawerEbrdList } from '@/app/(admin)/comp/drawer/ebrd/DrawerEbrdList';
import { MapOl } from '@/app/(admin)/comp/map/MapOl';
import ExpandView from '@/app/(admin)/comp/status/ExpandView';
import WorkCamera from '@/app/(admin)/comp/status/WorkCamera';
import WorkGate from '@/app/(admin)/comp/status/WorkGate';
import WorkWater from '@/app/(admin)/comp/status/WorkWater';
import Loading from '@/app/(admin)/comp/utils/Loading';
import { TopMenu } from '@/app/(admin)/topmenu/TopMenu';
import { TopMenuInfoTrue, useTopMenuStore } from '@/app/(admin)/topmenu/useTopMenuInfoStore';
import {
  IfWsMsg,
  IfWsMsgWaterGrpAction,
  IfWsMsgWaterGrpStat,
  isCameraStat,
  isEbrdStat,
  isEmcallEvt,
  isGateStat,
  isWaterEvt,
  isWaterGrpAction,
  isWaterGrpStat,
  isWaterStat,
  useWsMsg,
} from '@/app/ws/useWsMsg';
import {
  useCameraList,
  useEbrdList,
  useEmcallGrpList,
  useEmcallList,
  useGateList,
  useWaterList,
} from '@/hooks/useDevList';
import { useMobile } from '@/hooks/useMobile';
import { Box, Collapse, Grid } from '@mui/material';
import 'ol/ol.css';
import { useEffect, useState } from 'react';
import { useSysConf } from '@/store/useSysConf';
import { useDrawerEmcallGrpList } from '@/app/(admin)/comp/drawer/emcallgrp/DrawerEmcallGrpList';
import { useWaterGrp } from '@/app/(admin)/comp/water_grp/useWaterGrp';
import { ProtectedComponent } from '@/abilities/abilities';

export default function Home() {
  const { data: cameraList, mutate: mutateCameras } = useCameraList();
  const { data: gateList, mutate: mutateGates } = useGateList();
  const { data: waterList, mutate: mutateWaters } = useWaterList();
  const { data: ebrdList, mutate: mutateEbrds } = useEbrdList();
  const { data: emcallList, mutate: mutateEmcalls } = useEmcallList();
  const { data: emcallGrpList, mutate: mutateEmcallGrps } = useEmcallGrpList();

  const [expanded, setExpanded] = useState(false);
  const { sysConf } = useSysConf();

  const isCamera = sysConf?.use_camera_yn === 'Y';
  const isGate = sysConf?.use_gate_yn === 'Y';
  const isWater = sysConf?.use_water_yn === 'Y';
  const isEbrd = sysConf?.use_ebrd_yn === 'Y';
  const isEmcall = sysConf?.use_emcall_yn === 'Y';
  const isEmcallGrp = sysConf?.use_emcall_grp_yn === 'Y';

  const { isMobile } = useMobile();

  const { setTopMenuInfo } = useTopMenuStore();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setTopMenuInfo(new TopMenuInfoTrue());
  }, [setTopMenuInfo]);

  const doWaterGrpStat = (stat: IfWsMsgWaterGrpStat['grp_stat'], waterGrpId?: string) => {
    if (stat === 'CommErr') {
      refWaterGrpWarn.current?.close();
      refWaterGrpCrit.current?.close();
      refCommErr.current?.show({ waterGrpId: waterGrpId || '' });
    } else if (stat === ('Test' as any)) {
      refWaterGrpWarn.current?.close();
      refWaterGrpCrit.current?.close();
      refCommErr.current?.close();
    } else if (stat === 'Warn') {
      refWaterGrpCrit.current?.close();
      refCommErr.current?.close();
      refWaterGrpWarn.current?.show({ waterGrpId: waterGrpId || '' });
    } else if (stat === 'Crit') {
      refCommErr.current?.close();
      refWaterGrpWarn.current?.close();
      refWaterGrpCrit.current?.show({ waterGrpId: waterGrpId || '' });
    }
  };

  useWsMsg((msg) => {
    if (isWaterEvt(msg)) {
      mutateWaters();
    } else if (isGateStat(msg)) {
      mutateGates();
    } else if (isCameraStat(msg)) {
      mutateCameras();
    } else if (isEbrdStat(msg)) {
      mutateEbrds();
      // } else if (isEmcallStat(msg)) {
      //   mutateEmcalls();
    } else if (isEmcallEvt(msg)) {
      mutateEmcalls();
      mutateEmcallGrps();
    } else if (isWaterStat(msg)) {
      mutateWaters();
    } else if (isWaterGrpStat(msg)) {
      const wsmsg: IfWsMsg<IfWsMsgWaterGrpStat> = msg;
      const stat = wsmsg.data.grp_stat;
      doWaterGrpStat(stat, wsmsg.data.water_grp_id);
    } else if (isWaterGrpAction(msg)) {
      //
      const wsmsg: IfWsMsg<IfWsMsgWaterGrpAction> = msg;
      const action = wsmsg.data.grp_action;
      if (action === 'Autodown' || action === 'Down' || action === 'Stop' || action === 'Close') {
        refWaterGrpCrit.current?.stopTimer();
      }
    }
  });

  const handleClickExpand = () => {
    setExpanded(!expanded);
  };

  const {
    refCommErr,
    DlgCommErr,
    refWaterGrpWarn,
    DlgWaterGrpWarn,
    refWaterGrpCrit,
    DlgWaterGrpCrit,
  } = useWaterGrp();

  const [refCameraList, DrawerCameraList] = useDrawerCameraList();
  const [refGateList, DrawerGateList] = useDrawerGateList();
  const [refWaterList, DrawerWaterList] = useDrawerWaterList();
  const [refEmcallList, DrawerEmcallList] = useDrawerEmcallList();
  const [refEbrdList, DrawerEbrdList] = useDrawerEbrdList();
  const [refEmcallGrpList, DrawerEmcallGrpList] = useDrawerEmcallGrpList();
  const { topMenuInfo } = useTopMenuStore();

  useEffect(() => {
    if (refGateList) {
      if (
        topMenuInfo.camera &&
        topMenuInfo.gate &&
        topMenuInfo.water &&
        topMenuInfo.emcall &&
        topMenuInfo.ebrd &&
        topMenuInfo.emcallgrp
      ) {
        refCameraList.current?.close();
        refGateList.current?.close();
        refEbrdList.current?.close();
        refEmcallList.current?.close();
        refEmcallGrpList.current?.close();
        refWaterList.current?.close();
        return;
      }
      if (topMenuInfo.camera) {
        refCameraList.current?.open();
      } else {
        refCameraList.current?.close();
      }
      if (topMenuInfo.gate) {
        refGateList.current?.open();
      } else {
        refGateList.current?.close();
      }
      if (topMenuInfo.water) {
        refWaterList.current?.open();
      } else {
        refWaterList.current?.close();
      }
      if (topMenuInfo.emcall) {
        refEmcallList.current?.open();
      } else {
        refEmcallList.current?.close();
      }
      if (topMenuInfo.ebrd) {
        refEbrdList.current?.open();
      } else {
        refEbrdList.current?.close();
      }
      if (topMenuInfo.emcallgrp) {
        refEmcallGrpList.current?.open();
      } else {
        refEmcallGrpList.current?.close();
      }
    }
  }, [
    topMenuInfo,
    refCameraList,
    refWaterList,
    refGateList,
    refEmcallList,
    refEbrdList,
    refEmcallGrpList,
  ]);

  if (!mounted) return null;

  return (
    <ProtectedComponent action='view' subject='home'>
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <TopMenu />
        <Box
          sx={{
            height: '1px',
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
          }}
        >
          <DrawerCameraList />
          <DrawerGateList />
          <DrawerWaterList />
          <DrawerEmcallList />
          <DrawerEmcallGrpList />
          <DrawerEbrdList />
          <DlgCommErr />
          <DlgWaterGrpWarn />
          <DlgWaterGrpCrit />
          {mounted &&
          cameraList &&
          gateList &&
          waterList &&
          ebrdList &&
          emcallList &&
          emcallGrpList ? (
            <>
              <Collapse in={expanded} timeout='auto' orientation='horizontal' unmountOnExit>
                <Box className='status-header' id='status-header'>
                  <Grid container spacing={2} columns={{ xs: 1, md: 1, lg: 12 }}>
                    {!isMobile && (
                      <Grid size={{ xs: 12, md: 12, lg: 4 }}>{isCamera && <WorkCamera />}</Grid>
                    )}
                    <Grid size={{ xs: 12, md: 12, lg: 4 }}>{isGate && <WorkGate />}</Grid>
                    <Grid size={{ xs: 12, md: 12, lg: 4 }}> {isWater && <WorkWater />}</Grid>
                  </Grid>
                </Box>
              </Collapse>
              <ExpandView expand={expanded} setExpand={handleClickExpand} />
              <MapOl
                devs={
                  cameraList && gateList && waterList && ebrdList && emcallList
                    ? {
                        camera: isCamera && !isMobile ? cameraList : null,
                        gate: isGate ? gateList : null,
                        water: isWater ? waterList : null,
                        ebrd: isEbrd ? ebrdList : null,
                        emcall: isEmcall ? emcallList : null,
                        emcallgrp: isEmcallGrp ? emcallGrpList : null,
                      }
                    : null
                }
              />
            </>
          ) : (
            <Box sx={{ margin: 'auto' }}>
              <Loading />
            </Box>
          )}
        </Box>
      </Box>
    </ProtectedComponent>
  );
}
