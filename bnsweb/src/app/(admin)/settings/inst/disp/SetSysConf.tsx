'use client';
// @flow
import { FormSwitch } from '@/app/(admin)/settings/inst/disp/FormSwitch';
import { SettingTitleRow } from '@/app/(admin)/settings/inst/disp/SettingTitleRow';
import { useDebounceValue } from '@/hooks/useDebounceValue';
import { useSvrConf } from '@/store/useSvrConf';
import { useSysConf } from '@/store/useSysConf';
import SettingsIcon from '@mui/icons-material/Settings';
import { Alert, Box, Divider, TextField, Typography } from '@mui/material';
import { useEffect } from 'react';

type Props = {};
export const SetSysConf = ({}: Props) => {
  const { sysConf, saveSysConf } = useSysConf();
  // const [mapUrl, setMapUrl] = useState(sysConf.url_offline_map || '');

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     if (mapUrl !== sysConf.url_offline_map) {
  //       saveSysConf({ ...sysConf, url_offline_map: mapUrl }, true);
  //     }
  //   }, 1000);

  //   return () => clearTimeout(timer);
  //   // eslint-disable-next-line
  // }, [mapUrl]);

  // useEffect(() => {
  //   setMapUrl(sysConf.url_offline_map || '');
  // }, [sysConf.url_offline_map]);

  const [mapUrl, setMapUrl] = useDebounceValue(sysConf.url_offline_map, 1500, (v) => {
    saveSysConf({ ...sysConf, url_offline_map: v }, true);
  });

  // const [rtspSvrIpPort, setRtspSvrIpPort] = useDebounceValue(
  //   sysConf.rtsp_svr_ip_port,
  //   1500,
  //   (v) => {
  //     saveSysConf({ ...sysConf, rtsp_svr_ip_port: v }, true);
  //   }
  // );

  const [apiKeyMap, setApiKeyMap] = useDebounceValue(sysConf.api_key_map, 1500, (v) => {
    saveSysConf({ ...sysConf, api_key_map: v }, true);
  });
  const [apiKeyWeather, setApiKeyWeather] = useDebounceValue(sysConf.api_key_weather, 1500, (v) => {
    saveSysConf({ ...sysConf, api_key_weather: v }, true);
  });

  const { svrConf, saveSmsEnable, getSvrConf } = useSvrConf();

  useEffect(() => {
    getSvrConf();
  }, [getSvrConf]);

  const minWidth = 145;
  return (
    <>
      <Box sx={{ marginBottom: 2 }}></Box>
      <Divider sx={{ mb: 4 }} />
      <SettingTitleRow
        icon={<SettingsIcon />}
        title='시스템 설정'
        desc='시스템 설정을 변경합니다.'
      />
      <Box sx={{ mt: 2, ml: 2, mr: 2 }}>
        <Alert severity='warning'>
          전광판, 비상통화장치, 카메라, 차단장비, 수위계, 날씨, 오프라인 지도 등 기능에 대한 설정을
          할 수 있습니다.
          <br />V World API 키와 Weather API 키를 설정하실 수 있습니다.
        </Alert>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, mt: 2 }}>
          <Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ pl: 2, borderLeft: '2px solid #2196F3', mb: 1 }}>
                <Typography variant='subtitle2' color='primary' sx={{ mb: 1 }}>
                  기능 사용 여부 설정
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 0.1, flexWrap: 'wrap' }}>
                  <FormSwitch
                    minWidth={minWidth}
                    checked={sysConf.use_offline_map_yn === 'Y'}
                    onChange={(e) => {
                      saveSysConf(
                        { ...sysConf, use_offline_map_yn: e.target.checked ? 'Y' : 'N' },
                        true
                      );
                    }}
                    label='오프라인 지도'
                  />

                  <FormSwitch
                    minWidth={minWidth}
                    checked={sysConf.use_weather_yn === 'Y'}
                    onChange={(e) => {
                      saveSysConf(
                        { ...sysConf, use_weather_yn: e.target.checked ? 'Y' : 'N' },
                        true
                      );
                    }}
                    label='날씨'
                  />
                  <FormSwitch
                    minWidth={minWidth}
                    checked={sysConf.use_water_yn === 'Y'}
                    onChange={(e) => {
                      saveSysConf({ ...sysConf, use_water_yn: e.target.checked ? 'Y' : 'N' }, true);
                    }}
                    label='수위계'
                  />

                  <FormSwitch
                    minWidth={minWidth}
                    checked={sysConf.use_gate_yn === 'Y'}
                    onChange={(e) => {
                      saveSysConf({ ...sysConf, use_gate_yn: e.target.checked ? 'Y' : 'N' }, true);
                    }}
                    label='차단장비'
                  />
                  <FormSwitch
                    minWidth={minWidth}
                    checked={sysConf.use_camera_yn === 'Y'}
                    onChange={(e) => {
                      saveSysConf(
                        { ...sysConf, use_camera_yn: e.target.checked ? 'Y' : 'N' },
                        true
                      );
                    }}
                    label='카메라'
                  />
                  <FormSwitch
                    minWidth={minWidth}
                    checked={sysConf.use_ebrd_yn === 'Y'}
                    onChange={(e) => {
                      saveSysConf({ ...sysConf, use_ebrd_yn: e.target.checked ? 'Y' : 'N' }, true);
                    }}
                    label='전광판'
                  />
                  <FormSwitch
                    minWidth={minWidth}
                    checked={sysConf.use_emcall_yn === 'Y'}
                    onChange={(e) => {
                      saveSysConf(
                        { ...sysConf, use_emcall_yn: e.target.checked ? 'Y' : 'N' },
                        true
                      );
                    }}
                    label='비상벨'
                  />
                  <FormSwitch
                    minWidth={minWidth}
                    checked={sysConf.use_emcall_grp_yn === 'Y'}
                    onChange={(e) => {
                      saveSysConf(
                        { ...sysConf, use_emcall_grp_yn: e.target.checked ? 'Y' : 'N' },
                        true
                      );
                    }}
                    label='송출그룹'
                  />
                  <FormSwitch
                    minWidth={minWidth}
                    checked={sysConf.use_ndms_yn === 'Y'}
                    onChange={(e) => {
                      saveSysConf({ ...sysConf, use_ndms_yn: e.target.checked ? 'Y' : 'N' }, true);
                    }}
                    label='NDMS'
                  />
                  <FormSwitch
                    minWidth={minWidth}
                    checked={svrConf.sms_enable ?? false}
                    onChange={(e) => {
                      //saveSysConf({ ...sysConf, use_sms_yn: e.target.checked ? 'Y' : 'N' }, true);
                      saveSmsEnable(e.target.checked, true);
                    }}
                    label='SMS'
                  />

                  {/* <FormSwitch
                    minWidth={minWidth}
                    checked={sysConf.use_rtsp_svr_yn === 'Y'}
                    onChange={(e) => {
                      saveSysConf(
                        { ...sysConf, use_rtsp_svr_yn: e.target.checked ? 'Y' : 'N' },
                        true
                      );
                    }}
                    label='RTSP 서버'
                  /> */}
                </Box>
              </Box>
              <Box sx={{ pl: 2, borderLeft: '2px solid #2196F3', mb: 1 }}>
                <Typography variant='subtitle2' color='primary' sx={{ mb: 1 }}>
                  V World API 키 설정
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
                  <TextField
                    fullWidth
                    value={apiKeyMap || ''}
                    onChange={(e) => {
                      //saveSysConf({ ...sysConf, api_key_map: e.target.value }, false);
                      setApiKeyMap(e.target.value || '');
                    }}
                  />
                </Box>
              </Box>

              <Box sx={{ pl: 2, borderLeft: '2px solid #2196F3', mb: 1 }}>
                <Typography variant='subtitle2' color='primary' sx={{ mb: 1 }}>
                  Weather API 키 설정
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
                  <TextField
                    fullWidth
                    value={apiKeyWeather || ''}
                    onChange={(e) => {
                      //saveSysConf({ ...sysConf, api_key_weather: e.target.value }, false);
                      setApiKeyWeather(e.target.value || '');
                    }}
                  />
                </Box>
              </Box>
              <Box sx={{ pl: 2, borderLeft: '2px solid #2196F3', mb: 1 }}>
                <Typography variant='subtitle2' color='primary' sx={{ mb: 1 }}>
                  오프라인 맵 서버 URL
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
                  <TextField
                    fullWidth
                    value={mapUrl || ''}
                    onChange={(e) => {
                      //saveSysConf({ ...sysConf, url_offline_map: e.target.value }, false);
                      setMapUrl(e.target.value || '');
                    }}
                  />
                </Box>
              </Box>

              {/* <Box sx={{ pl: 2, borderLeft: '2px solid #2196F3', mb: 1 }}>
                <Typography variant='subtitle2' color='primary' sx={{ mb: 1 }}>
                  RTSP 서버 IP:PORT
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
                  <TextField
                    fullWidth
                    value={rtspSvrIpPort || ''}
                    onChange={(e) => {
                      //saveSysConf({ ...sysConf, url_offline_map: e.target.value }, false);
                      setRtspSvrIpPort(e.target.value || '');
                    }}
                  />
                </Box>
              </Box> */}
            </Box>
          </Box>
        </Box>
        {/* <Divider sx={{ mt: 2, mb: 2 }} />
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <Button variant='outlined' color='primary' onClick={handleReset}>
            모듈 설정 초기화
          </Button>
        </Box> */}
      </Box>
    </>
  );
};
