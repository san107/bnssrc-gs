import { Box, Typography } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import SettingsIcon from '@mui/icons-material/Settings';
import SendIcon from '@mui/icons-material/Send';
import WarningIcon from '@mui/icons-material/Warning';
import NotificationsIcon from '@mui/icons-material/Notifications';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';

export const EmcallHelpTooltip = () => {
  return (
    <Box sx={{ p: 1, width: 400 }}>
      <Box>
        <Typography
          variant='subtitle1'
          sx={{
            fontWeight: 700,
            mb: 2,
            pb: 1,
            color: '#abe2fe',
            borderBottom: '1px solid #D9EBFD',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <InfoIcon sx={{ fontSize: 20 }} />
          비상통화장치 사용설명서
        </Typography>
      </Box>
      <Typography
        variant='body2'
        sx={{
          mb: 1,
          fontWeight: 600,
          color: '#FCC628',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <SettingsIcon sx={{ fontSize: 18 }} />
        시스템 개요
      </Typography>
      <Typography variant='body2' sx={{ mb: 0.5 }}>
        비상통화장치는 비상상황 발생 시 즉각적인 알림과 대응을 위한 시스템입니다. 각 장치는 그룹으로
        관리되며, 그룹별로 독립적인 설정이 가능합니다.
      </Typography>

      <Typography
        variant='body2'
        sx={{
          mb: 1,
          mt: 2,
          fontWeight: 600,
          color: '#FCC628',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <NotificationsIcon sx={{ fontSize: 18 }} />
        기본 설정
      </Typography>
      <Typography variant='body2' sx={{ mb: 0.5 }}>
        • 전광판: 비상상황 발생 시 전광판에 알림을 표시합니다.
      </Typography>
      <Typography variant='body2' sx={{ mb: 0.5 }}>
        • 경광등: 비상상황 발생 시 경광등을 작동시킵니다.
      </Typography>

      <Typography
        variant='body2'
        sx={{
          mb: 1,
          mt: 2,
          fontWeight: 600,
          color: '#FCC628',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <VolumeUpIcon sx={{ fontSize: 18 }} />
        소리 설정
      </Typography>
      <Typography variant='body2' sx={{ mb: 0.5 }}>
        • 스피커: 기본 알림음을 통해 비상상황을 알립니다.
      </Typography>
      <Typography variant='body2' sx={{ mb: 0.5 }}>
        • TTS: 음성 메시지 안내를 통해 비상상황을 알립니다.
      </Typography>
      <Typography variant='body2' sx={{ mb: 0.5 }}>
        • TTS 메시지: 음성으로 안내할 메시지를 입력합니다.
      </Typography>

      <Typography
        variant='body2'
        sx={{
          mb: 1,
          mt: 2,
          fontWeight: 600,
          color: '#FCC628',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <SendIcon sx={{ fontSize: 18 }} />
        기능 버튼
      </Typography>
      <Typography variant='body2' sx={{ mb: 0.5 }}>
        • 전송: 설정한 내용을 비상통화장치 그룹에 즉시 적용합니다.
      </Typography>
      <Typography variant='body2' sx={{ mb: 0.5 }}>
        • 초기화: 모든 설정을 기본값으로 되돌립니다.
      </Typography>
      <Typography variant='body2' sx={{ mb: 0.5 }}>
        • 상태조회: 현재 비상통화장치 그룹의 상태를 확인합니다.
      </Typography>
      <Typography variant='body2' sx={{ mb: 0.5 }}>
        • 비상메시지: 설정에서 저장한, TTS 메시지를 TTS 메시지 설정 합니다.
      </Typography>

      <Typography
        variant='body2'
        sx={{
          mb: 1,
          mt: 2,
          fontWeight: 600,
          color: '#FCC628',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <WarningIcon sx={{ fontSize: 18 }} />
        주의 사항
      </Typography>
      <Typography variant='body2' sx={{ mb: 0.5 }}>
        • 스피커와 TTS는 동시에 사용할 수 없습니다.
      </Typography>
      <Typography variant='body2' sx={{ mb: 0.5 }}>
        • TTS 메시지는 TTS가 활성화된 경우에만 입력 가능합니다.
      </Typography>
      <Typography variant='body2' sx={{ mb: 0.5 }}>
        • 전송 버튼을 클릭해야 송출그룹에 적용됩니다.
      </Typography>
      <Typography variant='body2' sx={{ mb: 0.5 }}>
        • 상황종료 버튼을 클릭후 전송버튼을 클릭하여 비상통화장치 동작을 정지할 수 있습니다.
      </Typography>
    </Box>
  );
};
