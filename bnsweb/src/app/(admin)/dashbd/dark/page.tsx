'use client';

import React, { useEffect, useState } from 'react';
import CamGateListView from '@/app/(admin)/comp/display/CamGateListView';
import CamThumbView from '@/app/(admin)/comp/display/CamThumbView';
import NotiCountInfo from '@/app/(admin)/dashbd/dark/noti/NotiCountInfo';
import NotiSmsForm from '@/app/(admin)/dashbd/dark/noti/NotiSmsForm';
import WaterAlarm from '@/app/(admin)/comp/display/WaterAlarm';
import { Box } from '@mui/material';
import useSWR from 'swr';
import useWeather from '@/hooks/useWeather';
import { useSettingsStore } from '@/store/useSettingsStore';
import {
  useGateList,
  useWaterList,
  useCameraList,
  useEmcallList,
  useEbrdList,
} from '@/hooks/useDevList';
import { useMobile } from '@/hooks/useMobile';
import {
  isGateStat,
  isWaterEvt,
  isCameraStat,
  isEmcallStat,
  isEbrdStat,
  useWsMsg,
  isWaterStat,
} from '@/app/ws/useWsMsg';
import { IfTbGate, TbGate } from '@/models/gate/tb_gate';
import { IfTbWater, TbWater } from '@/models/water/tb_water';
import { Weather } from '@/app/(admin)/dashbd/dark/sections/Weather';
import { WeatherForecast } from '@/app/(admin)/dashbd/dark/sections/WeatherForecast';
import { WaterLocation } from '@/app/(admin)/dashbd/dark/sections/WaterLocation';
import { WaterStatus } from '@/app/(admin)/dashbd/dark/sections/WaterStatus';
import { CameraList } from '@/app/(admin)/dashbd/dark/sections/CameraList';
import { WaterList } from '@/app/(admin)/dashbd/dark/sections/WaterList';
import { GateList } from '@/app/(admin)/dashbd/dark/sections/GateList';
import { EmcallList } from '@/app/(admin)/dashbd/dark/sections/EmcallList';
import { EbrdList } from '@/app/(admin)/dashbd/dark/sections/EbrdList';
import { WaterStats } from '@/app/(admin)/dashbd/dark/sections/WaterStats';
import { GateStats } from '@/app/(admin)/dashbd/dark/sections/GateStats';
import { SidePanel } from '@/app/(admin)/dashbd/dark/SidePanel';
import { useSysConf } from '@/store/useSysConf';
import { useIsMounted } from '@/hooks/useIsMounted';
import { ProtectedComponent } from '@/abilities/abilities';

const Index = () => {
  const { data: gates, mutate: mutateGates } = useGateList();
  const { data: waters, mutate: mutateWaters } = useWaterList();
  const { data: cameras, mutate: mutateCameras } = useCameraList();
  const { data: emcalls, mutate: mutateEmcalls } = useEmcallList();
  const { data: ebrds, mutate: mutateEbrds } = useEbrdList();
  const [selWater, setSelWater] = useState<IfTbWater>(new TbWater());
  const [selGate, setSelGate] = useState<IfTbGate>(new TbGate());
  const { data: waterGates } = useSWR<IfTbGate[]>(
    !!selWater.water_seq && ['/api/water_gate/gatelist', { waterSeq: selWater.water_seq }]
  );
  const [openMainCam, setOpenMainCam] = useState<boolean>(false);
  const [openSubCam, setOpenSubCam] = useState<boolean>(false);
  const { pops, wsds, resultMsg } = useWeather(selWater);
  const { isMobile } = useMobile();
  const isMounted = useIsMounted();

  const {
    theme,
    showWeather,
    showWeatherForecast,
    showWaterLocation,
    showWaterStatus,
    showCameraList,
    showWaterList,
    showGateList,
    showEmcallList,
    showEbrdList,
    showWaterStats,
    showGateStats,
    dashboardOrder,
  } = useSettingsStore();

  const [countList, setCountList] = useState<string[]>([]);
  const [countTitle, setCountTitle] = useState<string | undefined>(undefined);
  const [alarms, setAlarms] = useState<IfTbWater[]>([]); // 수위계 알람 목록
  const [alarmOff, setAlarmOff] = useState<boolean>(false); // 알람 off
  const [sidePanelOpen, setSidePanelOpen] = useState(false);

  const { sysConf } = useSysConf();

  // 수위계 연관 차단장비 주 카메라 열기
  const viewMainCam = (open: boolean) => {
    setOpenMainCam(open);
    if (open) {
      setOpenSubCam(false);
    }
  };

  // 수위계 연관 차단장비 보조카메라 열기
  const viewSubCam = (open: boolean, data?: IfTbGate) => {
    setOpenSubCam(open);
    if (data) setSelGate(data);
    if (open) {
      setOpenMainCam(false);
    }
  };

  const showCountInfo = () => {
    const notification = document.getElementById('form-count-container');
    if (notification) notification?.classList.add('show');
  };

  const hideCountInfo = () => {
    const notification = document.getElementById('form-count-container');
    if (notification) notification?.classList.remove('show');
  };

  const showAlarmPopup = () => {
    const notification = document.getElementById('overlay-slidedown');
    if (notification) notification?.classList.remove('hide');
    if (notification) notification?.classList.add('show');
  };

  const hideAlarmPopup = () => {
    const notification = document.getElementById('overlay-slidedown');
    if (notification) notification?.classList.remove('show');
    if (notification) notification?.classList.add('hide');
  };

  const exNotiCount = (title: string, list: string[]) => {
    setCountTitle(title);
    setCountList(list);
    showCountInfo();
  };

  const exAlarmOff = () => {
    setAlarmOff(true);
    hideAlarmPopup();
  };

  useEffect(() => {
    if (!waters) return;
    if (!selWater.water_seq && waters.length > 0) {
      setSelWater(waters[0]);
    } else {
      // 선택된 것을 다시 찾아서 설정해줌. 변경된 것이 있을 수 있으니.
      const water = waters.find((ele) => ele.water_seq === selWater.water_seq);
      if (water) setSelWater(water);
    }
  }, [selWater.water_seq, waters]);

  // 수위계가 선택되면 연관된 차단장비 목록의 첫 번째 항목 선택
  useEffect(() => {
    if (waterGates && waterGates.length > 0) {
      setSelGate(waterGates[0]);
    }
  }, [waterGates]);

  useEffect(() => {
    // const noti = ['Norm', 'Attn', 'Warn', 'Alert', 'Crit']; // 테스트용
    const noti = ['Alert', 'Crit'];
    const alarmList = waters?.filter(
      (item) => noti.some((ele) => item.water_stat === ele) && item.comm_stat === 'Ok' // 통신상태가 정상인 경우만 알람을 띄움
      // (item) => noti.some((ele) => item.water_stat === ele) // 통신상태 상관없이 알람을 띄움 (테스트용용)
    );
    setAlarms(alarmList || []);
  }, [waters]);

  useEffect(() => {
    if (!alarmOff && alarms && alarms.length > 0) {
      showAlarmPopup();
    } else {
      hideAlarmPopup();
    }
  }, [alarms, alarmOff]);

  useWsMsg((msg) => {
    if (isWaterEvt(msg)) {
      mutateWaters();
    } else if (isGateStat(msg)) {
      mutateGates();
    } else if (isCameraStat(msg)) {
      mutateCameras();
    } else if (isEmcallStat(msg)) {
      mutateEmcalls();
    } else if (isEbrdStat(msg)) {
      mutateEbrds();
    } else if (isWaterStat(msg)) {
      mutateWaters();
    }
  });

  const dashboardSections = [
    {
      id: 'weather',
      show: sysConf.use_weather_yn === 'Y' && showWeather,
      content: <Weather selWater={selWater} isMobile={isMobile} />,
    },
    {
      id: 'weatherForecast',
      show: sysConf.use_weather_yn === 'Y' && showWeatherForecast,
      content: <WeatherForecast pops={pops} wsds={wsds} resultMsg={resultMsg} />,
    },
    {
      id: 'waterLocation',
      show: sysConf.use_water_yn === 'Y' && showWaterLocation,
      content: <WaterLocation selWater={selWater} theme={theme} />,
    },
    {
      id: 'waterStatus',
      show: sysConf.use_water_yn === 'Y' && showWaterStatus,
      content: <WaterStatus selWater={selWater} theme={theme} />,
    },
    {
      id: 'waterStats',
      show: sysConf.use_water_yn === 'Y' && showWaterStats,
      content: <WaterStats selWater={selWater} />,
    },
    {
      id: 'gateStats',
      show: sysConf.use_gate_yn === 'Y' && showGateStats && !!selGate.gate_seq,
      content: <GateStats selGate={selGate} />,
    },
    {
      id: 'cameraList',
      show: sysConf.use_camera_yn === 'Y' && showCameraList && !isMobile,
      content: <CameraList cameras={cameras} exNotiCount={exNotiCount} isMobile={isMobile} />,
    },
    {
      id: 'waterList',
      show: sysConf.use_water_yn === 'Y' && showWaterList,
      content: (
        <WaterList
          waters={waters}
          selWater={selWater}
          setSelWater={setSelWater}
          exNotiCount={exNotiCount}
          isMobile={isMobile}
        />
      ),
    },
    {
      id: 'gateList',
      show: sysConf.use_gate_yn === 'Y' && showGateList,
      content: (
        <GateList
          selWater={selWater}
          gates={gates}
          openMainCam={openMainCam}
          openSubCam={openSubCam}
          viewMainCam={viewMainCam}
          viewSubCam={viewSubCam}
          exNotiCount={exNotiCount}
          isMobile={isMobile}
        />
      ),
    },
    {
      id: 'ebrdList',
      show: sysConf.use_ebrd_yn === 'Y' && showEbrdList,
      content: <EbrdList ebrds={ebrds} exNotiCount={exNotiCount} />,
    },
    {
      id: 'emcallList',
      show: sysConf.use_emcall_yn === 'Y' && showEmcallList,
      content: <EmcallList emcalls={emcalls} exNotiCount={exNotiCount} />,
    },
  ].sort((a, b) => dashboardOrder.indexOf(a.id) - dashboardOrder.indexOf(b.id));

  if (!isMounted) return null;

  return (
    <ProtectedComponent action='view' subject='dashbd'>
      {/* 오른쪽 트리거 영역 */}
      <div
        style={{
          // position: 'fixed',
          position: 'absolute',
          top: 0,
          right: 0,
          width: 20,
          height: '100%',
          zIndex: 2001,
          cursor: 'pointer',
        }}
        onMouseEnter={() => setSidePanelOpen(true)}
      />
      <SidePanel open={sidePanelOpen} isMobile={isMobile} onClose={() => setSidePanelOpen(false)} />
      <Box
        className='dashbd'
        style={{
          overflowX: 'hidden',
          overflowY: 'auto',
          overscrollBehaviorX: 'none',
          overscrollBehaviorY: 'auto',
        }}
      >
        <Box className={theme === 'light' ? 'white-content' : ''}>
          <WaterAlarm waters={alarms} exAlarmOff={exAlarmOff} />
          <NotiSmsForm />
          <NotiCountInfo title={countTitle} list={countList} callback={hideCountInfo} />
          {openMainCam && <CamGateListView gateList={waterGates} />}
          {openSubCam && <CamThumbView gate_seq={selGate?.gate_seq} />}

          <div style={{ padding: isMobile ? 0 : '20px' }}>
            <div className='content'>
              <div className='row'>
                {dashboardSections.map(
                  (section) =>
                    section.show && (
                      <React.Fragment key={section.id}>{section.content}</React.Fragment>
                    )
                )}
              </div>
            </div>
            <footer className='footer'>
              <div className='container-fluid'>
                <div className='copyright'>
                  <a href='https://bnstechinc.com' target='_blank'>
                    (주)비엔에스테크
                  </a>{' '}
                  재난안전관리시스템
                </div>
              </div>
            </footer>
          </div>
        </Box>
      </Box>
    </ProtectedComponent>
  );
};

export default Index;
