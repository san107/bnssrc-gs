'use client';

import { useAlertStore, useDlgAlert } from '@/app/(admin)/comp/popup/DlgAlert';
import { useConfirmStore, useDlgConfrim } from '@/app/(admin)/comp/popup/DlgConfirm';
import { MenuIcon } from '@/app/(admin)/leftmenu/MenuIcon';
import PageAuth from '@/app/(admin)/leftmenu/PageAuth';
import { useLoginInfo, useLoginRole } from '@/app/(admin)/leftmenu/useLoginInfo';
import { useScriptJSMpeg } from '@/hooks/useScript';
import { useBnsEnv } from '@/store/useBnsEnv';
import { useConfigStore } from '@/store/useConfigStore';
import { useMounted } from '@/hooks/useMounted';
import { useSysConf } from '@/store/useSysConf';
import { Logout, Settings } from '@mui/icons-material';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PublicIcon from '@mui/icons-material/Public';
import ShareIcon from '@mui/icons-material/Share';
import { Box, styled } from '@mui/material';
import axios from 'axios';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GiCctvCamera } from 'react-icons/gi';
import { useSvrConf } from '@/store/useSvrConf';

//import { Home, Logout, Settings } from '@mui/icons-material';
//import BugReportIcon from '@mui/icons-material/BugReport';
// import { BoomGate } from '@/app/icons/BoomGate';
// import { LevelSlider } from '@/app/icons/LevelSlider';

type Props = {
  //
};

export const LeftMenu = ({}: Props) => {
  const router = useRouter();
  const { getlogin, logout } = useLoginInfo();
  const [refAlert, DlgAlert] = useDlgAlert();
  const { setRef } = useAlertStore();
  const [refConfirm, DlgConfirm] = useDlgConfrim();
  const { setRef: setConfirmRef } = useConfirmStore();

  // const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  // const [open, setOpen] = useState<boolean>(false);

  const mounted = useMounted();

  //useScript('/scripts/jsmpeg.min.js', 'jsmpeg.min.js'); // 동시에 여러개 띄울때 문재가 생겨, 미리 스크립트 로드함.
  useScriptJSMpeg();

  // const handleClick = (e: React.MouseEvent<HTMLElement>) => {
  //   setAnchorEl(e.currentTarget);
  //   setOpen(true);
  // };

  // const handleClose = () => {
  //   setAnchorEl(null);
  //   setOpen(false);
  // };

  useEffect(() => {
    getlogin();
  }, [getlogin]);

  useEffect(() => {
    (window as any).axios = axios;
    (window as any).LDMS_BUILD_TIME = process.env.NEXT_PUBLIC_BUILD_TIME;
    setRef(refAlert);
    setConfirmRef(refConfirm);
  }, [refAlert, setRef, refConfirm, setConfirmRef]);

  const { setConfig } = useConfigStore();

  useEffect(() => {
    axios.get('/api/config/one').then((res) => setConfig(res?.data || {}));
  }, [setConfig]);

  const { sysConf, getSysConf, loadSysConf } = useSysConf();
  useEffect(() => {
    loadSysConf();
  }, [loadSysConf]);

  useEffect(() => {
    getSysConf();
  }, [getSysConf]);

  const { getSvrConf, loadSvrConf } = useSvrConf();
  useEffect(() => {
    loadSvrConf();
  }, [loadSvrConf]);
  useEffect(() => {
    getSvrConf();
  }, [getSvrConf]);

  const { getBnsEnv } = useBnsEnv();
  useEffect(() => {
    getBnsEnv();
  }, [getBnsEnv]);

  const { isAdmin, isInst, hasAuth } = useLoginRole();

  const isWeather = sysConf?.use_weather_yn === 'Y';
  const isCamera = sysConf?.use_camera_yn === 'Y';
  const isNdms = sysConf?.use_ndms_yn === 'Y';

  return (
    <>
      <MenuBody sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* <Box
          sx={{ paddingX: 0, paddingY: 1.5, cursor: 'pointer', bgcolor: '#F57848' }}
          onClick={() => document.location.reload()}
          title='비엔에스테크 재난안전 솔루션'
        >
          <img src='/images/bnstech-logo.png' alt='bns tech logo'></img>
        </Box> */}
        <PageAuth />
        <Box
          className='relative'
          sx={{
            paddingX: 0.5,
            paddingTop: 2.5,
            // paddingBottom: 4,
            paddingBottom: 2.5,
            cursor: 'pointer',
            bgcolor: '#A8AFE1',
            background: 'radial-gradient(circle, rgba(168,175,225,1) 0%, rgba(137,159,219,1) 50%)',
          }}
          onClick={() => router.push('/')}
          title='비엔에스테크 재난안전 솔루션'
        >
          {!mounted || !sysConf?.logo_file_seq ? (
            <img src='/images/bnstech-logo2.png' alt='bns tech logo' className='logo' />
          ) : (
            <img
              src={`/api/public/file/download?fileSeq=${sysConf.logo_file_seq}`}
              alt='bns tech logo'
              className='logo'
            />
          )}
          {/* <Box
            className='absolute bottom-3 tracking-tighter text-center font-black left-0 right-0'
            sx={{ fontSize: 11, color: '#1f397b' }}
          >
            <span className='logo-text'>비엔에스테크</span>
          </Box> */}
        </Box>
        {/* <Box
          sx={{ padding: 1.5, cursor: 'pointer' }}
          onClick={() => document.location.reload()}
          title='비엔에스테크 재난안전 솔루션'
        >
          <img src='/images/favicon.ico' alt='bns tech logo'></img>
        </Box> */}
        {/* <Box sx={{ height: 10 }} /> */}
        <MenuIcon comp={PublicIcon} href='/' title='GIS' />
        {/* {process.env.NEXT_PUBLIC_ENABLE_CAMERA === 'Y' && (
          <MenuIcon comp={GiCctvCamera} href='/camera/' title='카메라' />
        )}
        {process.env.NEXT_PUBLIC_ENABLE_GATE === 'Y' && (
          <MenuIcon comp={BoomGate} href='/gate/' title='차단장비' />
        )}
        {process.env.NEXT_PUBLIC_ENABLE_WATER === 'Y' && (
          <MenuIcon comp={LevelSlider} href='/water/' title='수위계' />
        )} */}

        {/* <MenuIcon
          comp={DashboardIcon}
          href={['/dashbd/dark/', '/dashbd/weather/']}
          title='대시보드'
          onClick={(e) => {
            e.preventDefault();
            handleClick(e);
          }}
        />
        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
        >
          <List sx={{ padding: '3px', background: '#fae100' }}>
            <ListItem disablePadding sx={{ color: '#1e1e29', backgroundColor: '#f5f5f5' }}>
              <ListItemButton href='/dashbd/dark/'>
                <ListItemText primary='대시보드' />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding sx={{ color: '#1e1e29', backgroundColor: '#ccc' }}>
              <ListItemButton href='/dashbd/camera/'>
                <ListItemText primary='Camera' />
              </ListItemButton>
            </ListItem>
            {isYeongWol && (
              <ListItem disablePadding sx={{ color: '#1e1e29', backgroundColor: '#eee' }}>
                <ListItemButton href='/dashbd/weather/'>
                  <ListItemText primary='날씨(영월)' />
                </ListItemButton>
              </ListItem>
            )}
          </List>
        </Popover> */}

        <MenuIcon comp={DashboardIcon} href={'/dashbd/dark'} title='대시보드' />

        {isCamera && <MenuIcon comp={GiCctvCamera} href='/dashbd/camera' title='카메라' />}
        {isWeather && <MenuIcon comp={BeachAccessIcon} href='/dashbd/weather' title='강우량' />}
        {/* <MenuIcon comp={ShareIcon} href='/ndms/' title='NDMS' /> */}

        <Box sx={{ flexGrow: 1 }}></Box>
        {(isAdmin || isInst) && isNdms && (
          <MenuIcon comp={ShareIcon} href='/ndms' title='NDMS' hideTitle />
        )}
        {hasAuth('Admin') && (
          <MenuIcon comp={Settings} href='/settings/' title='환경설정' hideTitle />
        )}
        <MenuIcon
          title='로그아웃'
          hideTitle
          comp={Logout}
          href='/login'
          onClick={(e) => {
            e.preventDefault();
            logout();
          }}
        />
        {/* <MenuIcon
          comp={BugReportIcon}
          href='/tests/camera/'
          onClick={() => closeDrawerGateList()}
          title='테스트'
          hideTitle
        /> */}
        <Box sx={{ height: 30 }}></Box>
      </MenuBody>
      <DlgAlert />
      <DlgConfirm />
    </>
  );
};
const MenuBody = styled(Box)`
  //background-color: aliceblue;
  //background-color: #454545;
  //background-color: #3764ad;
  background-color: #2e4a8f;
  & .menubox {
    //color: #f8fafb;
    //color: #edfdf6;
    color: #e0f0f0;
    border-radius: 10;
    cursor: pointer;
    &.sel {
      color: white;
      background-color: #1f397b;
    }
    &:hover {
      color: white;
      background-color: #264083;
    }
    & .label {
      position: relative;
      width: 100%;
      height: 25px;
      & > label {
        position: absolute;
        cursor: pointer;
        left: 0;
        top: 0;
        width: 100%;
        font-size: small;
        margin-top: 0px;
      }
    }
  }
`;
