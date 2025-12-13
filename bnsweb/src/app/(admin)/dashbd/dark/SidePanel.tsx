'use client';

import {
  Box,
  Typography,
  Button,
  FormControlLabel,
  FormControl,
  RadioGroup,
  Radio,
  Divider,
  IconButton,
  Paper,
  Switch,
  Chip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import SettingsIcon from '@mui/icons-material/Settings';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import useColor from '@/hooks/useColor';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useSysConf } from '@/store/useSysConf';
import { useIsMounted } from '@/hooks/useIsMounted';
import { useState } from 'react';

type Props = {
  open: boolean;
  isMobile: boolean;
  onClose: () => void;
};

export const SidePanel = ({ open, isMobile, onClose }: Props) => {
  const isMounted = useIsMounted();
  const { color, setColor } = useColor();
  const {
    theme,
    setTheme,
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
  const [isPinned, setIsPinned] = useState(false);

  // 색상 변수
  const colors = {
    primary: theme === 'dark' ? '#8EA2DC' : '#3C4DAC',
    background: theme === 'dark' ? '#1D1D28' : '#fff',
    text: theme === 'dark' ? '#fff' : '#000',
    textSecondary: theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
    textSecondaryHover: theme === 'dark' ? '#fff' : '#000',
    divider: theme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
    switchBase: theme === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
    switchTrack: theme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
    chipBackground: theme === 'dark' ? 'rgba(142, 162, 220, 0.08)' : 'rgba(60, 77, 172, 0.04)',
    chipBackgroundHover: theme === 'dark' ? 'rgba(142, 162, 220, 0.12)' : 'rgba(60, 77, 172, 0.08)',
    iconButtonHover: theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
    pinnedIconButtonHover:
      theme === 'dark' ? 'rgba(142, 162, 220, 0.08)' : 'rgba(60, 77, 172, 0.04)',
  };

  if (!isMounted) {
    return null;
  }

  const styles = {
    paper: {
      position: 'fixed',
      top: 0,
      right: 0,
      width: 360,
      height: '100%',
      background: colors.background,
      color: colors.text,
      transform: open ? 'translateX(0)' : 'translateX(100%)',
      transition: 'transform 0.3s cubic-bezier(.4,0,.2,1)',
      zIndex: 2000,
      display: 'flex',
      flexDirection: 'column',
      padding: '24px',
      borderRadius: '0',
      overflowY: 'auto',
    },
    divider: {
      mb: 3,
      borderColor: colors.divider,
    },
    sectionTitle: {
      mb: 2,
      fontWeight: 500,
    },
    flexRowWrap: {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 1,
    },
    flexColumn: {
      display: 'flex',
      flexDirection: 'column',
      gap: 3,
    },
    formControlLabel: {
      fontSize: '0.75rem',
      flex: '1 1 45%',
    },
    iconButton: {
      color: colors.textSecondary,
      '&:hover': {
        color: colors.textSecondaryHover,
        backgroundColor: colors.iconButtonHover,
      },
    },
    pinnedIconButton: {
      color: isPinned ? colors.primary : colors.textSecondary,
      '&:hover': {
        color: colors.primary,
        backgroundColor: colors.pinnedIconButtonHover,
      },
    },
    radio: {
      color: colors.textSecondary,
      '&.Mui-checked': {
        color: colors.primary,
      },
    },
    switch: {
      '& .MuiSwitch-switchBase': {
        color: colors.switchBase,
      },
      '& .MuiSwitch-switchBase.Mui-checked': {
        color: colors.primary,
      },
      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
        backgroundColor: colors.primary,
        opacity: 0.5,
      },
      '& .MuiSwitch-track': {
        backgroundColor: colors.switchTrack,
      },
    },
    colorButton: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'transform 0.2s',
      '&:hover': {
        transform: 'scale(1.1)',
      },
    },
    moduleSection: {
      pl: 2,
      borderLeft: `2px solid ${colors.primary}`,
      mb: 1,
    },
    moduleTitle: {
      color: colors.primary,
      mb: 1,
      fontWeight: 500,
    },
    resetChip: {
      mt: 2,
      py: 1,
      borderRadius: 1,
      fontSize: '0.75rem',
      color: colors.primary,
      backgroundColor: colors.chipBackground,
      border: `1px solid ${colors.primary}`,
      '&:hover': {
        backgroundColor: colors.chipBackgroundHover,
      },
      cursor: 'pointer',
      '& .MuiChip-icon': {
        color: colors.primary,
      },
    },
    smsButton: {
      py: 1.5,
      borderRadius: 2,
      textTransform: 'none',
      fontWeight: 600,
    },
  };

  const changeColor = (color: string) => {
    setColor(color);
  };

  const showSmsPopup = () => {
    const notification = document.getElementById('form-sms-container');
    if (notification) notification?.classList.remove('hide');
    if (notification) notification?.classList.add('show');
  };

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

  const handlePinToggle = () => {
    setIsPinned(!isPinned);
  };

  const handleMouseLeave = () => {
    if (!isPinned) {
      onClose();
    }
  };

  return (
    <Paper elevation={8} sx={styles.paper} onMouseLeave={handleMouseLeave}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SettingsIcon
            sx={{
              fontSize: 24,
              color: theme === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
            }}
          />
          <Typography variant='h6' sx={{ fontWeight: 600 }}>
            설정
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            onClick={handlePinToggle}
            size='small'
            sx={styles.pinnedIconButton}
            title={isPinned ? '고정 해제' : '패널 고정'}
          >
            {isPinned ? <PushPinIcon /> : <PushPinOutlinedIcon />}
          </IconButton>
          <IconButton onClick={onClose} size='small' sx={styles.iconButton}>
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      <Divider sx={styles.divider} />

      <Box sx={{ mb: 4 }}>
        <Typography variant='subtitle1' sx={styles.sectionTitle}>
          테마 설정
        </Typography>
        <FormControl>
          <RadioGroup
            row
            value={theme}
            onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
          >
            <FormControlLabel
              value='dark'
              control={<Radio sx={styles.radio} />}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <DarkModeIcon sx={{ mr: 1, fontSize: 20 }} />
                  Dark
                </Box>
              }
            />
            <FormControlLabel
              value='light'
              control={<Radio sx={styles.radio} />}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LightModeIcon sx={{ mr: 1, fontSize: 20 }} />
                  Light
                </Box>
              }
            />
          </RadioGroup>
        </FormControl>
      </Box>

      <Divider sx={styles.divider} />

      <Box sx={{ mb: 4 }}>
        <Typography variant='subtitle1' sx={styles.sectionTitle}>
          색상 설정
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {[
            { color: '#255db8', name: 'blue' },
            { color: '#a7439e', name: 'pink' },
            { color: '#ff8d72', name: 'orange' },
          ].map((item) => (
            <Box
              key={item.name}
              sx={{
                ...styles.colorButton,
                background: item.color,
                boxShadow: color === item.name ? '0 0 0 2px #fff, 0 0 0 4px #000' : 'none',
              }}
              onClick={() => changeColor(item.name)}
            >
              {color === item.name && <span style={{ color: '#fff', fontSize: '20px' }}>✓</span>}
            </Box>
          ))}
        </Box>
      </Box>

      <Divider sx={styles.divider} />

      <Box sx={{ mb: 4 }}>
        <Typography variant='subtitle1' sx={styles.sectionTitle}>
          대시보드 표시 항목 설정
        </Typography>

        <Box sx={styles.flexColumn}>
          {sysConf.use_weather_yn === 'Y' && (
            <Box sx={styles.moduleSection}>
              <Typography variant='subtitle2' sx={styles.moduleTitle}>
                날씨 정보
              </Typography>
              <Box sx={styles.flexRowWrap}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={showWeather}
                      onChange={(e) => setShowWeather(e.target.checked)}
                      sx={styles.switch}
                    />
                  }
                  label='현재 날씨'
                  sx={styles.formControlLabel}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={showWeatherForecast}
                      onChange={(e) => setShowWeatherForecast(e.target.checked)}
                      sx={styles.switch}
                    />
                  }
                  label='날씨 예보'
                  sx={styles.formControlLabel}
                />
              </Box>
            </Box>
          )}

          {sysConf.use_water_yn === 'Y' && (
            <Box sx={styles.moduleSection}>
              <Typography variant='subtitle2' sx={styles.moduleTitle}>
                수위계 정보
              </Typography>
              <Box sx={styles.flexRowWrap}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={showWaterStatus}
                      onChange={(e) => setShowWaterStatus(e.target.checked)}
                      sx={styles.switch}
                    />
                  }
                  label='상태 정보'
                  sx={styles.formControlLabel}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={showWaterLocation}
                      onChange={(e) => setShowWaterLocation(e.target.checked)}
                      sx={styles.switch}
                    />
                  }
                  label='위치 정보'
                  sx={styles.formControlLabel}
                />
              </Box>
            </Box>
          )}

          {(sysConf.use_water_yn === 'Y' || sysConf.use_gate_yn === 'Y') && (
            <Box sx={styles.moduleSection}>
              <Typography variant='subtitle2' sx={styles.moduleTitle}>
                월별 통계
              </Typography>
              <Box sx={styles.flexRowWrap}>
                {sysConf.use_water_yn === 'Y' && (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={showWaterStats}
                        onChange={(e) => setShowWaterStats(e.target.checked)}
                        sx={styles.switch}
                      />
                    }
                    label='수위계'
                    sx={styles.formControlLabel}
                  />
                )}
                {sysConf.use_gate_yn === 'Y' && (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={showGateStats}
                        onChange={(e) => setShowGateStats(e.target.checked)}
                        sx={styles.switch}
                      />
                    }
                    label='차단장비'
                    sx={styles.formControlLabel}
                  />
                )}
              </Box>
            </Box>
          )}

          {(sysConf.use_camera_yn === 'Y' ||
            sysConf.use_water_yn === 'Y' ||
            sysConf.use_gate_yn === 'Y' ||
            sysConf.use_ebrd_yn === 'Y' ||
            sysConf.use_emcall_yn === 'Y') && (
            <Box sx={styles.moduleSection}>
              <Typography variant='subtitle2' sx={styles.moduleTitle}>
                목록 (상태 표시)
              </Typography>
              <Box sx={styles.flexRowWrap}>
                {sysConf.use_camera_yn === 'Y' && !isMobile && (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={showCameraList}
                        onChange={(e) => setShowCameraList(e.target.checked)}
                        sx={styles.switch}
                      />
                    }
                    label='카메라'
                    sx={styles.formControlLabel}
                  />
                )}
                {sysConf.use_water_yn === 'Y' && (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={showWaterList}
                        onChange={(e) => setShowWaterList(e.target.checked)}
                        sx={styles.switch}
                      />
                    }
                    label='수위계'
                    sx={styles.formControlLabel}
                  />
                )}
                {sysConf.use_gate_yn === 'Y' && (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={showGateList}
                        onChange={(e) => setShowGateList(e.target.checked)}
                        sx={styles.switch}
                      />
                    }
                    label='차단장비'
                    sx={styles.formControlLabel}
                  />
                )}
                {sysConf.use_ebrd_yn === 'Y' && (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={showEbrdList}
                        onChange={(e) => setShowEbrdList(e.target.checked)}
                        sx={styles.switch}
                      />
                    }
                    label='전광판'
                    sx={styles.formControlLabel}
                  />
                )}
                {sysConf.use_emcall_yn === 'Y' && (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={showEmcallList}
                        onChange={(e) => setShowEmcallList(e.target.checked)}
                        sx={styles.switch}
                      />
                    }
                    label='비상통화장치'
                    sx={styles.formControlLabel}
                  />
                )}
              </Box>
            </Box>
          )}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Chip
            onClick={handleReset}
            icon={<RefreshIcon />}
            label='표시 항목 설정 초기화'
            size='small'
            sx={styles.resetChip}
          />
        </Box>
      </Box>

      <Divider sx={styles.divider} />

      <Box sx={{ mt: 'auto' }}>
        <Button
          onClick={showSmsPopup}
          variant='contained'
          color='primary'
          fullWidth
          sx={styles.smsButton}
        >
          SMS 전송
        </Button>
      </Box>
    </Paper>
  );
};
