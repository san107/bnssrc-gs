'use client';

/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useMounted } from '@/hooks/useMounted';
import {
  Box,
  Button,
  Checkbox,
  CssBaseline,
  FormControl,
  FormControlLabel,
  FormLabel,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import MuiCard from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { useSysConf } from '@/store/useSysConf';

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  [theme.breakpoints.up('sm')]: {
    maxWidth: '450px',
  },
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  ...theme.applyStyles('dark', {
    boxShadow:
      'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
}));
const SignInContainer = styled(Stack)(({ theme }) => ({
  height: 'calc((1 - var(--template-frame-height, 0)) * 100dvh)',
  minHeight: '100%',
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
  },
  '&::before': {
    content: '""',
    display: 'block',
    position: 'absolute',
    zIndex: -1,
    inset: 0,
    backgroundImage: 'radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))',
    backgroundRepeat: 'no-repeat',
    ...theme.applyStyles('dark', {
      backgroundImage: 'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
    }),
  },
}));

export default function SignIn(props: { disableCustomTheme?: boolean }) {
  const [userIdError, setUserIdError] = React.useState(false);
  const [userIdErrorMessage, setUserIdErrorMessage] = React.useState('');
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');
  const [rememberMe, setRememberMe] = useLocalStorage('BNS_REMEMBER_ME', false);
  const [localUserId, setLocalUserId] = useLocalStorage('BNS_USER_ID', '');
  const mounted = useMounted();
  const [userId, setUserId] = React.useState('');

  const { sysConf, getSysConf } = useSysConf();
  React.useEffect(() => {
    getSysConf();
  }, [getSysConf]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    const info = {
      user_id: data.get('userId'),
      user_pass: data.get('password'),
    };
    setLocalUserId('' + data.get('userId'));
    axios
      .post('/api/auth/login', info)
      .then((res) => {
        console.log('login ok ', res.data);
        router.push('/');
      })
      .catch((e) => {
        console.error('E', e);
      });
  };

  const router = useRouter();

  const validateInputs = (e: React.MouseEvent) => {
    const userId = document.getElementById('userId') as HTMLInputElement;
    const password = document.getElementById('password') as HTMLInputElement;

    let isValid = true;

    if (!userId.value) {
      setUserIdError(true);
      setUserIdErrorMessage('사용자ID를 입력하여 주십시오');
      isValid = false;
    } else {
      setUserIdError(false);
      setUserIdErrorMessage('');
    }

    if (!password.value || password.value.length < 4) {
      setPasswordError(true);
      setPasswordErrorMessage('비밀번호 4자리 이상을 입력하여 주십시오');
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage('');
    }

    if (!isValid) {
      e.stopPropagation();
      e.preventDefault();
    }

    return isValid;
  };
  const userIdRef = React.useRef<HTMLInputElement>(null);
  const passwordRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    if (!mounted) return;
    if (!rememberMe) {
      setLocalUserId('');
      userIdRef.current?.querySelector('input')?.focus();
    } else {
      if (localUserId) {
        setUserId(localUserId);
        passwordRef.current?.querySelector('input')?.focus();
        console.log('passwordRef', passwordRef.current);
      } else {
        userIdRef.current?.querySelector('input')?.focus();
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rememberMe, localUserId]);

  return (
    <div
      {...props}
      css={css`
        &::before {
          content: '';
          display: block;
          position: absolute;
          opacity: 0.05;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          background-image: url('/images/login-bg.jpg');
        }
      `}
    >
      <CssBaseline enableColorScheme />
      <SignInContainer direction='column' justifyContent='space-between'>
        <Card variant='outlined'>
          {/* 로고 위치 */}
          <Box sx={{ margin: 'auto' }}>
            {!mounted || !sysConf?.login_logo_file_seq ? (
              <img
                src='/images/logo-on.png'
                alt='로고'
                // width={127}
                // height={58}
                width='100%'
                style={{ minWidth: '127px', maxWidth: '200px' }}
              />
            ) : (
              <img
                src={`/api/public/file/download?fileSeq=${sysConf.login_logo_file_seq}`}
                alt='로고'
                // width={127}
                // height={58}
                width='100%'
                style={{ minWidth: '127px', maxWidth: '200px' }}
              />
            )}
          </Box>
          <Typography
            component='h2'
            variant='h4'
            sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
          >
            로그인
          </Typography>
          <Box
            component='form'
            onSubmit={handleSubmit}
            noValidate
            sx={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              gap: 2,
            }}
          >
            <FormControl>
              <FormLabel htmlFor='userId'>ID</FormLabel>
              <TextField
                error={userIdError}
                helperText={userIdErrorMessage}
                id='userId'
                type='userId'
                name='userId'
                value={userId}
                onChange={(e) => setUserId(e.target.value || '')}
                placeholder='로그인 ID'
                autoComplete='userId'
                ref={userIdRef}
                required
                fullWidth
                variant='outlined'
                autoFocus
                color={userIdError ? 'error' : 'primary'}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor='password'>비밀번호</FormLabel>
              <TextField
                error={passwordError}
                helperText={passwordErrorMessage}
                name='password'
                placeholder='비밀번호'
                type='password'
                id='password'
                autoComplete='current-password'
                ref={passwordRef}
                required
                fullWidth
                variant='outlined'
                color={passwordError ? 'error' : 'primary'}
              />
            </FormControl>
            <FormControlLabel
              control={
                <Checkbox
                  checked={rememberMe}
                  color='primary'
                  onClick={() => setRememberMe(!rememberMe)}
                />
              }
              label='ID 기억하기'
            />
            <Button
              type='submit'
              fullWidth
              variant='contained'
              onClick={validateInputs}
              size='large'
            >
              로그인
            </Button>
          </Box>
        </Card>
      </SignInContainer>
    </div>
  );
}
