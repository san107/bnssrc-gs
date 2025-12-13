'use client';

import WaterAlarm from '@/app/(admin)/comp/display/WaterAlarm';
import CamGateListView from '@/app/(admin)/comp/display/CamGateListView';
import CamThumbView from '@/app/(admin)/comp/display/CamThumbView';
import { MapView } from '@/app/(admin)/comp/display/MapView';
import NotiSmsForm from '@/app/(admin)/comp/display/NotiSmsForm';
import { DashboardBody } from '@/app/(admin)/dashbd/light/DashboardBody';
import { GateTable } from '@/app/(admin)/dashbd/light/GateTable';
import { WaterTable } from '@/app/(admin)/dashbd/light/WaterTable';
import WeatherView from '@/app/(admin)/dashbd/light/WeatherView';
import { isCameraStat, isGateStat, isWaterEvt, isWaterStat, useWsMsg } from '@/app/ws/useWsMsg';
import useWeather from '@/hooks/useWeather';
import { IfTbCamera } from '@/models/tb_camera';
import { IfTbGate, TbGate } from '@/models/gate/tb_gate';
import { IfTbWater, TbWater } from '@/models/water/tb_water';
import * as weatherutils from '@/utils/weather-utils';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { Box, Button, Grid, List, ListItemButton, ListItemText } from '@mui/material';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import useSWR from 'swr';
import { ProtectedComponent } from '@/abilities/abilities';

const boxHeight = 500;
const smboxHeight = 80;

type Props = {
  title?: string;
  list?: string[];
  callback?: () => void;
};

const CountInfoForm = ({ title, list, callback }: Props) => {
  return (
    <ProtectedComponent action='view' subject='dashbd'>
      <div className='form-count-container' id='form-count-container'>
        <div className='noti-count-header'>
          <span className='icon icon-small-close' id='notification-close' onClick={callback}></span>
          {title} 목록
        </div>
        <Box sx={{ padding: '20px' }}>
          <List>
            {list && list?.length > 0 ? (
              (list || []).map((row, idx) => (
                <ListItemButton key={idx}>
                  <ListItemText primary={row} />
                </ListItemButton>
              ))
            ) : (
              <ListItemText primary={'해당 항목이 없습니다.'} sx={{ textAlign: 'center' }} />
            )}
          </List>
        </Box>
      </div>
    </ProtectedComponent>
  );
};

const Index = () => {
  const { data: cameras, mutate: mutateCameras } = useSWR<IfTbCamera[]>(['/api/camera/list']);
  const { data: gates, mutate: mutateGates } = useSWR<IfTbGate[]>(['/api/gate/list']);
  const { data: waters, mutate: mutateWaters } = useSWR<IfTbWater[]>(['/api/water/list']);
  const [selWater, setSelWater] = useState<IfTbWater>(new TbWater());
  const [selGate, setSelGate] = useState<IfTbGate>(new TbGate());
  const { data: waterGates } = useSWR<IfTbGate[]>(
    !!selWater.water_seq && ['/api/water_gate/gatelist', { waterSeq: selWater.water_seq }]
  );
  const [openMainCam, setOpenMainCam] = useState<boolean>(false); // 주카메라
  const [openSubCam, setOpenSubCam] = useState<boolean>(false); // 보조카메라
  const { tmp, sky, pty, pop, wsd, vec, resultMsg, weatherList } = useWeather(selWater); // 날씨 정보

  const [camErrCount, setCamErrCount] = useState<number>(0);
  const [gateErrCount, setGateErrCount] = useState<number>(0);
  const [waterErrCount, setWaterErrCount] = useState<number>(0);
  const [gateUpCount, setGateUpCount] = useState<number>(0);
  const [gateDownCount, setGateDownCount] = useState<number>(0);
  const [waterAlertCount, setWaterAlertCount] = useState<number>(0);
  const [waterCritCount, setWaterCritCount] = useState<number>(0);
  const [countList, setCountList] = useState<string[]>([]);
  const [countTitle, setCountTitle] = useState<string | undefined>(undefined);
  const [clock, setClock] = useState<string | undefined>(undefined); // 시계
  const [alarms, setAlarms] = useState<IfTbWater[]>([]); // 수위계 알람 목록
  const [alarmOff, setAlarmOff] = useState<boolean>(false); // 알람 off

  // 수위계 연관 차단장비 주 카메라 열기
  const viewMainCam = (open: boolean) => {
    // if (openSubCam) {
    //   toast.error('보조카메라를 먼저 닫고 확인바랍니다.');
    //   return;
    // }
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

  useEffect(() => {
    // 장애 카운트 (카메라)
    const camErrCnt = (cameras || []).filter(
      (ele) => !ele.cam_stat || ele.cam_stat == 'Err'
    ).length;
    // 장애 카운트 (차단장비)
    const gateErrCnt = (gates || [])?.filter(
      (ele) => !ele.gate_stat || ele.gate_stat === 'Na'
    ).length;
    // 장애 카운트 (수위계)
    const waterErrCnt = (waters || [])?.filter(
      (ele) => !ele.comm_stat || ele.comm_stat === 'Err'
    ).length;
    // 열림 카운트 (차단장비)
    const gateUpCnt = (gates || [])?.filter(
      (ele) => ele.gate_stat === 'UpOk' || ele.gate_stat === 'UpLock'
    ).length;
    // 닫힘 카운트 (차단장비)
    const gateDownCnt = (gates || [])?.filter((ele) => ele.gate_stat === 'DownOk').length;
    // 경계 카운트 (수위계)
    const waterAlertCnt = (waters || [])?.filter(
      (ele) => !ele.water_stat || ele.water_stat === 'Alert'
    ).length;
    // 심각 카운트 (수위계)
    const waterCritCnt = (waters || [])?.filter(
      (ele) => !ele.water_stat || ele.water_stat === 'Crit'
    ).length;

    setCamErrCount(camErrCnt);
    setGateErrCount(gateErrCnt);
    setWaterErrCount(waterErrCnt);
    setGateUpCount(gateUpCnt);
    setGateDownCount(gateDownCnt);
    setWaterAlertCount(waterAlertCnt);
    setWaterCritCount(waterCritCnt);
  }, [cameras, gates, waters]);

  const handleClickCount = (type: string, count: number, stat?: string) => {
    if (count === 0) return;
    let list: string[] = [];
    if (type === 'camera') {
      setCountTitle('카메라 장애');
      list = (cameras || [])
        .filter((ele) => !ele?.cam_stat || ele?.cam_stat == 'Err')
        .map((ele) => ele?.cam_nm || '');
    } else if (type === 'gate') {
      if (stat === 'Up') {
        setCountTitle('차단장비 열림상태');
        list = (gates || [])
          .filter((ele) => ele?.gate_stat === 'UpOk' || ele?.gate_stat === 'UpLock')
          .map((ele) => ele?.gate_nm || '');
      } else if (stat === 'Down') {
        setCountTitle('차단장비 닫힘상태');
        list = (gates || [])
          .filter((ele) => ele?.gate_stat === 'DownOk')
          .map((ele) => ele?.gate_nm || '');
      } else {
        setCountTitle('차단장비 장애');
        list = (gates || [])
          .filter((ele) => !ele?.gate_stat || ele?.gate_stat === 'Na')
          .map((ele) => ele?.gate_nm || '');
      }
    } else if (type === 'water') {
      if (stat === 'Alert') {
        setCountTitle('수위계 경계상태');
        list = (waters || [])
          .filter((ele) => !ele?.water_stat || ele?.water_stat === 'Alert')
          .map((ele) => ele?.water_nm || '');
      } else if (stat === 'Crit') {
        setCountTitle('수위계 심각상태');
        list = (waters || [])
          .filter((ele) => !ele?.water_stat || ele?.water_stat === 'Crit')
          .map((ele) => ele?.water_nm || '');
      } else {
        setCountTitle('수위계 장애');
        list = (waters || [])
          .filter((ele) => !ele?.comm_stat || ele?.comm_stat === 'Err')
          .map((ele) => ele?.water_nm || '');
      }
    }
    setCountList(list);
    showCountInfo();
  };

  const showCountInfo = () => {
    const notification = document.getElementById('form-count-container');
    if (notification) notification?.classList.add('show');
  };

  const hideCountInfo = () => {
    const notification = document.getElementById('form-count-container');
    if (notification) notification?.classList.remove('show');
  };

  const showSmsPopup = () => {
    const notification = document.getElementById('form-sms-container');
    if (notification) notification?.classList.remove('hide');
    if (notification) notification?.classList.add('show');
  };

  const showWeatherPopup = () => {
    if (!weatherList || weatherList?.length === 0) {
      toast.error('날씨 정보를 불러올 수 없습니다.');
      return;
    }
    const notification = document.getElementById('overlay-slidedown2');
    if (notification) notification?.classList.remove('hide');
    if (notification) notification?.classList.add('show');
  };

  const showWAlarmPopup = () => {
    const notification = document.getElementById('overlay-slidedown');
    if (notification) notification?.classList.remove('hide');
    if (notification) notification?.classList.add('show');
  };

  const hideAlarmPopup = () => {
    const notification = document.getElementById('overlay-slidedown');
    if (notification) notification?.classList.remove('show');
    if (notification) notification?.classList.add('hide');
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

  useEffect(() => {
    // const noti = ['Norm', 'Attn', 'Warn', 'Alert', 'Crit']; // 테스트용
    const noti = ['Alert', 'Crit'];
    const alarmList = waters?.filter(
      (item) => noti.some((ele) => item.water_stat === ele) && item.comm_stat === 'Ok' // 통신상태가 정상인 경우만 알람을 띄움
    );
    setAlarms(alarmList || []);
    if (!alarmOff && alarmList && alarmList?.length > 0) {
      showWAlarmPopup();
    } else {
      hideAlarmPopup();
    }
  }, [waters, alarmOff]);

  useWsMsg((msg) => {
    if (isWaterEvt(msg)) {
      mutateWaters();
    } else if (isGateStat(msg)) {
      mutateGates();
    } else if (isCameraStat(msg)) {
      mutateCameras();
    } else if (isWaterStat(msg)) {
      mutateWaters();
    }
  });

  useEffect(() => {
    setClock(weatherutils.displayClock);
    const id = setInterval(() => {
      setClock(weatherutils.displayClock);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <Box className='dashbd'>
      <WaterAlarm waters={alarms} exAlarmOff={exAlarmOff} />
      <NotiSmsForm />
      {weatherList && (
        <WeatherView
          weatherList={weatherList}
          currTmp={tmp}
          currPty={pty}
          currSky={sky}
          currPop={pop}
          water={selWater}
        />
      )}
      <CountInfoForm title={countTitle} list={countList} callback={hideCountInfo} />
      {openMainCam && <CamGateListView gateList={waterGates} />}
      {openSubCam && <CamThumbView gate_seq={selGate?.gate_seq} />}

      <div style={{ padding: '10px 20px 10px 20px' }}>
        <Grid container spacing={2}>
          <Grid size={12}>
            <div className='card'>
              <div className='card-header card-header-blue'>
                <h4 className='card-title'>
                  <DashboardIcon /> 대시보드
                </h4>
              </div>
              <div className='card-body'>
                <div
                  className='fleft bold c-gray'
                  style={{ whiteSpace: 'pre-wrap', cursor: 'pointer' }}
                  onClick={showWeatherPopup}
                >
                  {resultMsg === 'NO_DATA' ? (
                    <span style={{ color: 'red' }}>날씨 정보를 불러올 수 없습니다.</span>
                  ) : sky ? (
                    `날씨: ${weatherutils.getSkyStat(
                      sky
                    )}   기온: ${tmp}℃   강수형태: ${weatherutils.getPtyStat(
                      pty
                    )}   강수확률: ${pop}%   풍향: ${weatherutils.getVecStat(vec)}  풍속: ${wsd}m/s`
                  ) : (
                    <span className='load-weather'>날씨 정보를 불러오는 중입니다</span>
                  )}
                </div>
                <div className='fright'>
                  <Button variant='outlined' color='error' onClick={showSmsPopup}>
                    SMS 전송
                  </Button>
                </div>
              </div>
            </div>
          </Grid>
        </Grid>

        <Grid container spacing={2} columns={{ xs: 1, sm: 4, md: 12 }}>
          <Grid size={{ xs: 1, sm: 6, md: 6, lg: 3 }}>
            <div className='card card-stats' style={{ minHeight: smboxHeight }}>
              <div className='card-header card-header-danger card-header-icon'>
                <div className='card-icon'>장애</div>
                <div className='muti-label'>
                  <p className='card-category'>수위계</p>
                  <h3
                    className='card-count'
                    onClick={() => handleClickCount('water', waterErrCount)}
                  >
                    <span className={waterErrCount > 0 ? 'c-err' : 'c-norm'}>{waterErrCount}</span>
                    <span className='c-norm'>/{waters?.length}</span>
                  </h3>
                </div>
                <div className='muti-label'>
                  <p className='card-category'>차단장비</p>
                  <h3 className='card-count' onClick={() => handleClickCount('gate', gateErrCount)}>
                    <span className={gateErrCount > 0 ? 'c-err' : 'c-norm'}>{gateErrCount}</span>
                    <span className='c-norm'>/{gates?.length}</span>
                  </h3>
                </div>
                <div className='muti-label'>
                  <p className='card-category'>카메라</p>
                  <h3
                    className='card-count'
                    onClick={() => handleClickCount('camera', camErrCount)}
                  >
                    <span className={camErrCount > 0 ? 'c-err' : 'c-norm'}>{camErrCount}</span>
                    <span className='c-norm'>/{cameras?.length}</span>
                  </h3>
                </div>
              </div>
            </div>
          </Grid>
          <Grid size={{ xs: 1, sm: 6, md: 6, lg: 3 }}>
            <div className='card card-stats' style={{ minHeight: smboxHeight }}>
              <div className='card-header card-header-success card-header-icon'>
                <div className='card-icon'>차단장비 상태</div>
                <div className='muti-label'>
                  <p className='card-category'>닫힘</p>
                  <h3
                    className='card-count'
                    onClick={() => handleClickCount('gate', gateDownCount, 'Down')}
                  >
                    <span className={gateDownCount > 0 ? 'c-down' : 'c-norm'}>{gateDownCount}</span>
                    <span className='c-norm'>/{gates?.length}</span>
                  </h3>
                </div>
                <div className='muti-label'>
                  <p className='card-category'>열림</p>
                  <h3
                    className='card-count'
                    onClick={() => handleClickCount('gate', gateUpCount, 'Up')}
                  >
                    <span className={gateUpCount > 0 ? 'c-up' : 'c-norm'}>{gateUpCount}</span>
                    <span className='c-norm'>/{gates?.length}</span>
                  </h3>
                </div>
              </div>
            </div>
          </Grid>
          <Grid size={{ xs: 1, sm: 6, md: 6, lg: 3 }}>
            <div className='card card-stats' style={{ minHeight: smboxHeight }}>
              <div className='card-header card-header-info card-header-icon'>
                <div className='card-icon'>수위계 상태</div>
                <div className='muti-label'>
                  <p className='card-category'>심각</p>
                  <h3
                    className='card-count'
                    onClick={() => handleClickCount('water', waterCritCount, 'Crit')}
                  >
                    <span className={waterCritCount > 0 ? 'c-crit' : 'c-norm'}>
                      {waterCritCount}
                    </span>
                    <span className='c-norm'>/{waters?.length}</span>
                  </h3>
                </div>
                <div className='muti-label'>
                  <p className='card-category'>경계</p>
                  <h3
                    className='card-count'
                    onClick={() => handleClickCount('water', waterAlertCount, 'Alert')}
                  >
                    <span className={waterAlertCount > 0 ? 'c-alert' : 'c-norm'}>
                      {waterAlertCount}
                    </span>
                    <span className='c-norm'>/{waters?.length}</span>
                  </h3>
                </div>
              </div>
            </div>
          </Grid>
          <Grid size={{ xs: 1, sm: 6, md: 6, lg: 3 }}>
            <div className='card card-stats'>
              <Box minHeight={smboxHeight} className='clock'>
                <h3 className='card-count'>{clock}</h3>
              </Box>
            </div>
          </Grid>
        </Grid>

        <Grid container spacing={2} columns={{ xs: 1, sm: 4, md: 12 }}>
          <Grid size={{ xs: 1, sm: 4, md: 6, lg: 3 }}>
            <div className='card card-chart'>
              <div className='card-header card-header-blue'>수위계 목록</div>
              <div className='card-body'>
                <MapView
                  lat={selWater?.water_lat}
                  lng={selWater?.water_lng}
                  width={'100%'}
                  height={300}
                  ignoreClick
                  zoom={17}
                />
                <Box minHeight={boxHeight - 300}>
                  <WaterTable
                    waters={waters}
                    selWater={selWater}
                    setSelWater={setSelWater}
                    mainOpen={openMainCam}
                    subOpen={openSubCam}
                  />
                </Box>
              </div>
            </div>
          </Grid>
          <Grid size={{ xs: 1, sm: 4, md: 6, lg: 6 }}>
            <div className='card card-chart'>
              <div className='card-header card-header-blue'>현재 수위계 상태</div>
              <div className='card-body'>
                <Box minHeight={boxHeight}>
                  <DashboardBody selWater={selWater} />
                </Box>
              </div>
            </div>
          </Grid>
          <Grid size={{ xs: 1, sm: 4, md: 6, lg: 3 }}>
            <div className='card card-chart'>
              <div className='card-header card-header-blue'>
                <span>수위계 연관 차단장비</span>
                <span className='absolute right-3 bottom-3'>
                  <Button
                    size='small'
                    color={openMainCam ? 'secondary' : 'info'}
                    onClick={() => viewMainCam(!openMainCam)}
                  >
                    {openMainCam ? '주카메라 닫기' : '주카메라 보기'}
                  </Button>
                </span>
              </div>
              <div className='card-body'>
                <Box minHeight={boxHeight}>
                  <GateTable
                    selWater={selWater}
                    mainOpen={openMainCam}
                    subOpen={openSubCam}
                    setSubOpen={viewSubCam}
                  />
                </Box>
              </div>
            </div>
          </Grid>
        </Grid>
      </div>
    </Box>
  );
};

export default Index;
