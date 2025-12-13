import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Paper,
  Divider,
  IconButton,
  Alert,
  FormControlLabel,
  Switch,
  TextField,
  Card,
  CardContent,
  Stack,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import InfoIcon from '@mui/icons-material/Info';
import NotificationsIcon from '@mui/icons-material/Notifications';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import { IfTbEmcallEvtHist } from '@/models/emcall/tb_emcall_evt_hist';
import { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onClose: () => void;
  selData: IfTbEmcallEvtHist | null;
}

const commStyles = {
  warning: {
    border: '1px solid',
    borderColor: 'warning.light',
    bgcolor: 'warning.lighter',
    color: 'warning.dark',
  },
  primary: {
    border: '1px solid',
    borderColor: 'primary.light',
    bgcolor: 'background.default',
  },
  subtitle: {
    color: 'primary.dark',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    gap: 1,
  },
  button: {
    px: 3,
    py: 1,
    borderRadius: 1.5,
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '1rem',
  },
  textField: {
    '& .MuiOutlinedInput-root': {
      '&:hover fieldset': {
        borderColor: 'primary.main',
      },
      '& fieldset': {
        borderColor: 'primary.light',
      },
      '&.Mui-disabled': {
        '& fieldset': {
          borderColor: 'primary.light',
          opacity: 0.5,
        },
        '& input': {
          color: 'text.disabled',
        },
      },
    },
    '& .MuiInputLabel-root.Mui-disabled': {
      color: 'text.disabled',
    },
  },
};

export default function DlgEmcallEvt({ open, onClose, selData }: Props) {
  const [evtSettings, setEvtSettings] = useState({
    msg: 'On',
    light: 'On',
    speaker: 'Off',
    speaker_tts: 'On',
    tts_msg: '',
  });

  if (!selData) return null;

  const handleChangeSettings = (field: string, value: string | boolean) => {
    setEvtSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSendEvt = () => {
    axios
      .post('/api/emcall/send_event', { device_id: selData.emcall_id, ...evtSettings })
      .then((_res) => {
        toast.success('전송하였습니다.');
        onClose();
      })
      .catch((e) => {
        console.error('E', e);
        toast.error('실패하였습니다.(error : ' + e?.message + ')');
      });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='sm'
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            ...commStyles.warning,
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid',
          ...commStyles.warning,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningAmberIcon sx={{ fontSize: 28, color: 'warning.main' }} />
          <Typography variant='h6' component='div' sx={{ fontWeight: 600 }}>
            비상통화장치 알림
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          size='small'
          sx={{
            color: 'warning.dark',
            '&:hover': {
              bgcolor: 'warning.light',
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Alert severity='warning' sx={{ mt: 2, mb: 2 }}>
          비상벨 버튼이 눌렸습니다. 즉시 확인 바랍니다.
        </Alert>
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: 2,
            ...commStyles.warning,
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography
                variant='subtitle2'
                sx={{
                  minWidth: '100px',
                  fontWeight: 600,
                }}
              >
                장치 ID
              </Typography>
              <Typography variant='body1' sx={{ color: '#333', fontWeight: 600 }}>
                {selData.emcall_id}
              </Typography>
            </Box>

            <Divider sx={{ borderColor: 'warning.light' }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography
                variant='subtitle2'
                sx={{
                  minWidth: '100px',
                  fontWeight: 600,
                }}
              >
                발생 시간
              </Typography>
              <Typography variant='body1' sx={{ color: '#333', fontWeight: 600 }}>
                {new Date(selData.emcall_evt_dt || '').toLocaleString()}
              </Typography>
            </Box>
          </Box>
        </Paper>
        <Box sx={{ mt: 3 }}>
          <Typography
            variant='subtitle1'
            sx={{
              mb: 1,
              ...commStyles.subtitle,
            }}
          >
            <InfoIcon sx={{ fontSize: 20, color: 'primary.main' }} />
            이벤트 설정
          </Typography>

          <Card
            elevation={0}
            sx={{
              borderRadius: 2,
              ...commStyles.primary,
            }}
          >
            <CardContent>
              <Stack spacing={3}>
                <Box>
                  <Typography
                    variant='subtitle2'
                    sx={{
                      mb: 1,
                      ...commStyles.subtitle,
                    }}
                  >
                    <NotificationsIcon sx={{ fontSize: 20 }} />
                    기본 설정
                  </Typography>
                  <Stack direction='row' spacing={4}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={evtSettings.msg === 'On'}
                          onChange={(e) =>
                            handleChangeSettings('msg', e.target.checked ? 'On' : 'Off')
                          }
                          color='primary'
                        />
                      }
                      label='메시지'
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={evtSettings.light === 'On'}
                          onChange={(e) =>
                            handleChangeSettings('light', e.target.checked ? 'On' : 'Off')
                          }
                          color='primary'
                        />
                      }
                      label='조명'
                    />
                  </Stack>
                </Box>

                <Box>
                  <Typography
                    variant='subtitle2'
                    sx={{
                      mb: 1,
                      ...commStyles.subtitle,
                    }}
                  >
                    <VolumeUpIcon sx={{ fontSize: 20 }} />
                    소리 설정
                  </Typography>
                  <Stack direction='row' spacing={4}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={evtSettings.speaker === 'On'}
                          onChange={(e) => {
                            const newState = e.target.checked ? 'On' : 'Off';
                            handleChangeSettings('speaker', newState);
                            handleChangeSettings('speaker_tts', newState === 'On' ? 'Off' : 'On');
                            if (newState === 'On') handleChangeSettings('tts_msg', '');
                          }}
                          color='primary'
                        />
                      }
                      label='스피커'
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={evtSettings.speaker_tts === 'On'}
                          onChange={(e) => {
                            const newState = e.target.checked ? 'On' : 'Off';
                            handleChangeSettings('speaker_tts', newState);
                            handleChangeSettings('speaker', newState === 'On' ? 'Off' : 'On');
                          }}
                          color='primary'
                        />
                      }
                      label='TTS'
                    />
                  </Stack>
                </Box>

                <Box>
                  <Typography
                    variant='subtitle2'
                    sx={{
                      mb: 2,
                      ...commStyles.subtitle,
                    }}
                  >
                    <RecordVoiceOverIcon sx={{ fontSize: 20 }} />
                    TTS 메시지
                  </Typography>
                  <TextField
                    fullWidth
                    size='small'
                    label='TTS 메시지를 입력하세요.'
                    value={evtSettings.tts_msg}
                    onChange={(e) => handleChangeSettings('tts_msg', e.target.value)}
                    multiline
                    rows={2}
                    disabled={evtSettings.speaker_tts === 'Off'}
                    sx={commStyles.textField}
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </DialogContent>
      <DialogActions
        sx={{
          p: 2.5,
          borderTop: '1px solid',
          ...commStyles.warning,
          gap: 2,
        }}
      >
        <Button
          onClick={handleSendEvt}
          variant='contained'
          color='primary'
          sx={{
            ...commStyles.button,
            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)',
            '&:hover': {
              boxShadow: '0 6px 16px rgba(25, 118, 210, 0.3)',
            },
          }}
        >
          이벤트 전송
        </Button>
        <Button
          onClick={onClose}
          variant='contained'
          color='warning'
          sx={{
            ...commStyles.button,
            boxShadow: '0 4px 12px rgba(237, 108, 2, 0.2)',
            '&:hover': {
              boxShadow: '0 6px 16px rgba(237, 108, 2, 0.3)',
            },
          }}
        >
          취소
        </Button>
      </DialogActions>
    </Dialog>
  );
}
