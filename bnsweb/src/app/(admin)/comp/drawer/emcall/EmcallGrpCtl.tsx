// @flow
import { IfItgStat, IfTbEmcallGrp, ItgStat } from '@/models/emcall/tb_emcall_grp';
import NotificationsIcon from '@mui/icons-material/Notifications';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  Typography,
  Tooltip,
  Chip,
  Collapse,
  Alert,
} from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import useSWR from 'swr';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { useMobile } from '@/hooks/useMobile';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { EmcallHelpTooltip } from '@/app/(admin)/comp/drawer/emcall/EmcallHelpTooltip';
import SendIcon from '@mui/icons-material/Send';
import YoutubeSearchedForIcon from '@mui/icons-material/YoutubeSearchedFor';
import VoiceChatIcon from '@mui/icons-material/VoiceChat';
import StopIcon from '@mui/icons-material/Stop';

type Props = {
  grp_seq: number | undefined;
};

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
export const EmcallGrpCtl = ({ grp_seq }: Props) => {
  const { data } = useSWR<IfTbEmcallGrp>(
    !!grp_seq && [`/api/emcall_grp/one?emcallGrpSeq=${grp_seq}`]
  );

  const [evtSettings, setEvtSettings] = useState<IfItgStat>(new ItgStat());

  const { data: evtRemote } = useSWR<IfItgStat>(
    !!grp_seq && [`/api/emcall_grp/get_stat?emcall_grp_seq=${grp_seq}`]
  );
  useEffect(() => {
    if (evtRemote) {
      setEvtSettings(evtRemote);
    } else {
      setEvtSettings(new ItgStat());
    }
  }, [evtRemote]);

  const handleClickStat = () => {
    setEvtSettings(new ItgStat());
    axios
      .get(`/api/emcall_grp/get_stat?emcall_grp_seq=${grp_seq}`)
      .then((res) => {
        console.log('success', res.data);
        setEvtSettings(res.data);
        toast.success('성공하였습니다.');
      })
      .catch((err) => {
        console.error('error', err);
        toast.error('상태 조회 실패 하였습니다');
      });
  };

  const handleClickSend = () => {
    if (!data?.emcall_grp_id) {
      toast.error('비상통화장치 송출 그룹 정보가 없습니다.');
      return;
    }
    const body = { ...evtSettings, device_id: data.emcall_grp_id };
    axios
      .post('/api/emcall_grp/send_stat', body)
      .then((res) => {
        console.log('success', res.data);
        toast.success('성공하였습니다.');
      })
      .catch((err) => {
        console.error('error', err);
        toast.error('전송 실패 하였습니다');
      });
  };

  const handleClickReset = () => {
    setEvtSettings(new ItgStat());
  };

  const handleClickEmerMsg = () => {
    console.log('handleClickEmerMsg');
    const tts_msg = data?.emcall_tts_msg || '';

    setEvtSettings({
      ...new ItgStat(),
      speaker: tts_msg ? 'Off' : 'On',
      speaker_tts: tts_msg ? 'On' : 'Off',
      tts_msg,
      light: 'On',
    });
  };

  const { isMobile } = useMobile();
  const [expanded, setExpanded] = useState(true);

  if (!grp_seq) return null;
  return (
    <div>
      <Card elevation={0}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
            <Chip
              icon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              label={expanded ? '접기' : '펼치기'}
              size='small'
              onClick={() => setExpanded(!expanded)}
              sx={{
                border: '1px solid',
                borderColor: 'primary.light',
                backgroundColor: '#fff',
                color: 'primary.dark',
                cursor: 'pointer',
                '& .MuiChip-icon': {
                  color: 'primary.main',
                },
                '& .MuiChip-label': {
                  fontWeight: 500,
                },
                '&:hover': {
                  backgroundColor: 'primary.lighter',
                },
              }}
            />
            <Tooltip
              title={<EmcallHelpTooltip />}
              arrow
              placement={isMobile ? 'bottom' : 'right'}
              slotProps={{
                popper: {
                  sx: {
                    '& .MuiTooltip-tooltip': {
                      width: 420,
                      maxWidth: 'none',
                      bgcolor: '#2E4A8F',
                    },
                  },
                },
              }}
            >
              <Chip
                icon={<HelpOutlineIcon />}
                label='사용설명서'
                size='small'
                onClick={() => {}}
                sx={{
                  border: '1px solid',
                  borderColor: 'warning.light',
                  backgroundColor: '#fff',
                  color: 'warning.dark',
                  '& .MuiChip-icon': {
                    color: 'warning.main',
                  },
                  '& .MuiChip-label': {
                    fontWeight: 500,
                  },
                }}
              />
            </Tooltip>
          </Box>
          <Collapse in={expanded}>
            <Stack spacing={0}>
              <Box sx={{ pt: 2 }}>
                <Typography
                  variant='h6'
                  sx={{ ...commStyles.subtitle, '& span': { fontSize: '0.8em' } }}
                >
                  <Box component='span'>송출그룹 : </Box>
                  {data?.emcall_grp_nm}
                  <Box component='span'>매칭코드 : </Box>
                  {data?.emcall_grp_id}
                </Typography>
              </Box>
              <Box>
                <Typography
                  variant='subtitle2'
                  sx={{
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
                          setEvtSettings({ ...evtSettings, msg: e.target.checked ? 'On' : 'Off' })
                        }
                        color='primary'
                      />
                    }
                    label='전광판'
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={evtSettings.light === 'On'}
                        onChange={(e) =>
                          setEvtSettings({ ...evtSettings, light: e.target.checked ? 'On' : 'Off' })
                        }
                        color='primary'
                      />
                    }
                    label='경광등'
                  />
                </Stack>
              </Box>

              <Box>
                <Typography
                  variant='subtitle2'
                  sx={{
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
                          const s = { ...evtSettings };
                          s.speaker = newState;
                          if (newState === 'On') {
                            if (s.speaker_tts === 'On') s.speaker_tts = 'Off';
                            s.tts_msg = '';
                          }
                          setEvtSettings(s);
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
                          const s = { ...evtSettings };
                          s.speaker_tts = newState;
                          if (newState === 'On') {
                            if (s.speaker === 'On') s.speaker = 'Off';
                            s.tts_msg = '';
                          }
                          setEvtSettings(s);
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
                  onChange={(e) => setEvtSettings({ ...evtSettings, tts_msg: e.target.value })}
                  multiline
                  rows={2}
                  disabled={evtSettings.speaker_tts === 'Off'}
                  sx={commStyles.textField}
                />
              </Box>
              <Box
                display='flex'
                gap={1}
                sx={{ pt: 1, justifyContent: 'space-between', width: '100%' }}
              >
                <Button
                  variant='contained'
                  color='primary'
                  onClick={handleClickSend}
                  sx={{ flex: 1 }}
                >
                  <Stack alignItems='center' spacing={0.5}>
                    <SendIcon />
                    <Box>전송</Box>
                  </Stack>
                </Button>
                <Button
                  variant='contained'
                  color='secondary'
                  onClick={handleClickStat}
                  sx={{ flex: 1 }}
                >
                  <Stack alignItems='center' spacing={0.5}>
                    <YoutubeSearchedForIcon />
                    <Box>상태조회</Box>
                  </Stack>
                </Button>
                <Button
                  variant='contained'
                  color='info'
                  onClick={handleClickReset}
                  sx={{ flex: 1 }}
                >
                  <Stack alignItems='center' spacing={0.5}>
                    <StopIcon />
                    <Box>상황종료</Box>
                  </Stack>
                </Button>
                <Button
                  variant='contained'
                  color='error'
                  onClick={handleClickEmerMsg}
                  sx={{ flex: 1 }}
                >
                  <Stack alignItems='center' spacing={0.5}>
                    <VoiceChatIcon />
                    <Box sx={{ whiteSpace: 'nowrap' }}>비상메시지</Box>
                  </Stack>
                </Button>
              </Box>
              <Box sx={{ mt: 1 }}>
                <Alert severity='error' sx={{ py: 0 }}>
                  전송 버튼을 클릭해야 송출그룹에 적용됩니다.
                </Alert>
              </Box>
            </Stack>
          </Collapse>
        </CardContent>
      </Card>
    </div>
  );
};
