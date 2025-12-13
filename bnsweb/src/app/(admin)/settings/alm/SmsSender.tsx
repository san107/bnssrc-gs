import { Edit } from '@mui/icons-material';
import { Box, Button, TextField, Typography } from '@mui/material';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export const SmsSender = () => {
  const [smsSenderPhone, setSmsSenderPhone] = useState('');
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [tempPhone, setTempPhone] = useState('');

  useEffect(() => {
    axios
      .get('/api/config/getenv/SMS_SENDER_PHONE')
      .then((res) => {
        setSmsSenderPhone(res.data.value);
        setTempPhone(res.data.value);
      })
      .catch((err) => {
        console.error('Failed to load env value:', err);
      });
  }, []);

  const handlePhoneEdit = () => {
    setTempPhone(smsSenderPhone);
    setIsEditingPhone(true);
  };

  const handlePhoneSave = () => {
    axios
      .post('/api/config/setenv', {
        key: 'SMS_SENDER_PHONE',
        value: tempPhone,
      })
      .then(() => {
        setSmsSenderPhone(tempPhone);
        setIsEditingPhone(false);
        toast.success('발신자 번호가 변경되었습니다.');
      })
      .catch((err) => {
        console.error('Failed to update env value:', err);
      });
  };

  const handlePhoneCancel = () => {
    setTempPhone(smsSenderPhone);
    setIsEditingPhone(false);
  };

  return (
    <Box
      sx={{ backgroundColor: '#e3f2fd', padding: '16px', borderRadius: '5px', marginTop: '15px' }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant='subtitle2' fontWeight={700}>
          SMS 발신자 번호
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        {!isEditingPhone ? (
          <>
            <Typography
              variant='body1'
              sx={{
                flex: 1,
                fontSize: '1.2rem',
                fontWeight: 600,
                color: '#1976d2',
                backgroundColor: '#fff',
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #e0e0e0',
              }}
            >
              {smsSenderPhone}
            </Typography>
            <Button
              size='small'
              onClick={handlePhoneEdit}
              startIcon={<Edit />}
              sx={{
                padding: '8px 8px',
                fontSize: '0.9rem',
                '&.MuiButton-root': {
                  minHeight: 'unset',
                },
              }}
            >
              변경
            </Button>
          </>
        ) : (
          <>
            <TextField
              size='small'
              fullWidth
              value={tempPhone}
              onChange={(e) => setTempPhone(e.target.value)}
              placeholder='발신자 번호를 입력하세요'
              sx={{
                flex: 1,
                '& .MuiInputBase-input': {
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  color: '#1976d2',
                },
              }}
            />
            <Box>
              <Button
                size='small'
                onClick={handlePhoneSave}
                sx={{
                  padding: '8px 8px',
                  marginRight: '10px',
                  fontSize: '0.9rem',
                  '&.MuiButton-root': {
                    minHeight: 'unset',
                  },
                }}
              >
                저장
              </Button>
              <Button
                size='small'
                onClick={handlePhoneCancel}
                color='secondary'
                sx={{
                  padding: '8px 8px',
                  fontSize: '0.9rem',
                  '&.MuiButton-root': {
                    minHeight: 'unset',
                  },
                }}
              >
                취소
              </Button>
            </Box>
          </>
        )}
      </Box>
      <Typography variant='subtitle2' fontWeight={700} sx={{ mt: 2, mb: 1 }}>
        예상 문자 예시
      </Typography>
      <Typography variant='body2' gutterBottom>
        {`
        • 현재 수위가 'xx'미터에 도달하여 '수동 제어' 대기중입니다.
        `}
        <br />
        {`• 현재수위가 A수위가 'xx'미터, B수위 'xx'미터로 측정되며 '자동 제어 조건에 도달하여'
        60초 후 '자동차단 예정'입니다.
        `}
      </Typography>
    </Box>
  );
};
