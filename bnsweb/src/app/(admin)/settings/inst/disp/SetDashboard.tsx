'use client';

import { useSettingsStore } from '@/store/useSettingsStore';
import { useSysConf } from '@/store/useSysConf';
import { SettingTitle } from '@/app/(admin)/settings/comp/SettingTitle';
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize';
import { listStyles } from '@/app/(admin)/settings/comp/commStyles';
import {
  Box,
  Typography,
  Card,
  FormControlLabel,
  Switch,
  Radio,
  RadioGroup,
  FormControl,
  SvgIcon,
  Divider,
  Alert,
  Button,
} from '@mui/material';
import Preview from '@/app/(admin)/settings/inst/disp/Preview';
import { useIsMounted } from '@/hooks/useIsMounted';

export const SetDashboard = () => {
  const isMounted = useIsMounted();
  const {
    theme,
    showWeather,
    showWeatherForecast,
    showWaterLocation,
    showWaterStatus,
    showWaterStats,
    showGateStats,
    showCameraList,
    showWaterList,
    showGateList,
    showEbrdList,
    showEmcallList,
    setTheme,
    setShowWeather,
    setShowWeatherForecast,
    setShowWaterLocation,
    setShowWaterStatus,
    setShowWaterStats,
    setShowGateStats,
    setShowCameraList,
    setShowWaterList,
    setShowGateList,
    setShowEbrdList,
    setShowEmcallList,
    setDashboardOrder,
  } = useSettingsStore();
  const { sysConf } = useSysConf();

  const handleReset = () => {
    setShowWeather(true);
    setShowWeatherForecast(true);
    setShowWaterLocation(true);
    setShowWaterStatus(true);
    setShowWaterStats(true);
    setShowGateStats(true);
    setShowCameraList(true);
    setShowWaterList(true);
    setShowGateList(true);
    setShowEbrdList(true);
    setShowEmcallList(true);
    setDashboardOrder([
      'weather',
      'weatherForecast',
      'waterLocation',
      'waterStatus',
      'waterStats',
      'gateStats',
      'cameraList',
      'waterList',
      'gateList',
      'ebrdList',
      'emcallList',
    ]);
  };

  if (!isMounted) return null;

  return (
    <Card sx={listStyles.cardNone}>
      <SettingTitle>
        <Box sx={listStyles.titleBox}>
          <SvgIcon fontSize='large'>
            <DashboardCustomizeIcon />
          </SvgIcon>
        </Box>
        <Box>
          <Typography variant='h5' fontWeight={700} color='text.primary'>
            대시 보드 설정
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={listStyles.titleText}>
            대시보드 테마와 표시 항목을 설정합니다.
          </Typography>
        </Box>
      </SettingTitle>

      <Box sx={{ mt: 4, ml: 2, mr: 2 }}>
        <Typography variant='h6' fontWeight={700} color='text.primary'>
          대시보드 테마 설정
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <FormControl>
          <RadioGroup
            row
            value={theme}
            onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
          >
            <FormControlLabel value='dark' control={<Radio />} label='Dark' />
            <FormControlLabel value='light' control={<Radio />} label='Light' />
          </RadioGroup>
        </FormControl>
      </Box>

      <Box sx={{ mt: 4, ml: 2, mr: 2 }}>
        <Typography variant='h6' fontWeight={700} color='text.primary'>
          대시보드 모듈 설정
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Alert severity='success'>
          대시보드 구성을 원하시는 대로 커스터마이징 하실 수 있습니다. <br />
          아래에서 대시보드에 표시할 모듈을 선택하고, 모듈 순서(위치) 설정 화면에서 드래그 앤
          드롭으로 모듈을 자유롭게 이동하며 레이아웃을 설정하실 수 있습니다.
        </Alert>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            mt: 2,
          }}
        >
          <Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {sysConf.use_weather_yn === 'Y' && (
                <Box sx={{ pl: 2, borderLeft: '2px solid #2196F3', mb: 1 }}>
                  <Typography variant='subtitle2' color='primary' sx={{ mb: 1 }}>
                    날씨 정보
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={showWeather}
                          onChange={(e) => setShowWeather(e.target.checked)}
                        />
                      }
                      label='현재 날씨'
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={showWeatherForecast}
                          onChange={(e) => setShowWeatherForecast(e.target.checked)}
                        />
                      }
                      label='날씨 예보'
                    />
                  </Box>
                </Box>
              )}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                  {sysConf.use_water_yn === 'Y' && (
                    <Box sx={{ pl: 2, borderLeft: '2px solid #2196F3', mb: 1, flex: 1 }}>
                      <Typography variant='subtitle2' color='primary' sx={{ mb: 1 }}>
                        수위계
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={showWaterStatus}
                              onChange={(e) => setShowWaterStatus(e.target.checked)}
                            />
                          }
                          label='수위계 상태'
                        />
                        <FormControlLabel
                          control={
                            <Switch
                              checked={showWaterLocation}
                              onChange={(e) => setShowWaterLocation(e.target.checked)}
                            />
                          }
                          label='수위계 위치'
                        />
                        <FormControlLabel
                          control={
                            <Switch
                              checked={showWaterList}
                              onChange={(e) => setShowWaterList(e.target.checked)}
                            />
                          }
                          label='수위계 목록'
                        />
                        <FormControlLabel
                          control={
                            <Switch
                              checked={showWaterStats}
                              onChange={(e) => setShowWaterStats(e.target.checked)}
                            />
                          }
                          label='수위계 월별 통계'
                        />
                      </Box>
                    </Box>
                  )}
                  {sysConf.use_gate_yn === 'Y' && (
                    <Box sx={{ pl: 2, borderLeft: '2px solid #2196F3', mb: 1, flex: 1 }}>
                      <Typography variant='subtitle2' color='primary' sx={{ mb: 1 }}>
                        차단장비
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={showGateList}
                              onChange={(e) => setShowGateList(e.target.checked)}
                            />
                          }
                          label='차단장비 목록'
                        />
                        <FormControlLabel
                          control={
                            <Switch
                              checked={showGateStats}
                              onChange={(e) => setShowGateStats(e.target.checked)}
                            />
                          }
                          label='차단장비 월별 통계'
                        />
                      </Box>
                    </Box>
                  )}
                  {sysConf.use_camera_yn === 'Y' && (
                    <Box sx={{ pl: 2, borderLeft: '2px solid #2196F3', mb: 1, flex: 1 }}>
                      <Typography variant='subtitle2' color='primary' sx={{ mb: 1 }}>
                        카메라
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={showCameraList}
                              onChange={(e) => setShowCameraList(e.target.checked)}
                            />
                          }
                          label='카메라 목록'
                        />
                      </Box>
                    </Box>
                  )}
                </Box>

                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                  {sysConf.use_ebrd_yn === 'Y' && (
                    <Box sx={{ pl: 2, borderLeft: '2px solid #2196F3', mb: 1, flex: 1 }}>
                      <Typography variant='subtitle2' color='primary' sx={{ mb: 1 }}>
                        전광판
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={showEbrdList}
                              onChange={(e) => setShowEbrdList(e.target.checked)}
                            />
                          }
                          label='전광판 목록'
                        />
                      </Box>
                    </Box>
                  )}
                  {sysConf.use_emcall_yn === 'Y' && (
                    <Box sx={{ pl: 2, borderLeft: '2px solid #2196F3', mb: 1, flex: 1 }}>
                      <Typography variant='subtitle2' color='primary' sx={{ mb: 1 }}>
                        비상통화장치
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={showEmcallList}
                              onChange={(e) => setShowEmcallList(e.target.checked)}
                            />
                          }
                          label='비상통화장치 목록'
                        />
                      </Box>
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          </Box>
          <Box>
            <Typography variant='h6' fontWeight={700} color='text.primary' sx={{ mb: 2 }}>
              모듈 순서(위치) 설정
            </Typography>
            <Box>
              <Preview />
            </Box>
          </Box>
        </Box>
        <Divider sx={{ mt: 2, mb: 2 }} />
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <Button variant='outlined' color='primary' onClick={handleReset}>
            모듈 설정 초기화
          </Button>
        </Box>
      </Box>
    </Card>
  );
};
