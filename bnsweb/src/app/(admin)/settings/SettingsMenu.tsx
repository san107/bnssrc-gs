'use client';
// @flow
import { useGrpDepth, useLoginRole } from '@/app/(admin)/leftmenu/useLoginInfo';
import { SettingsMenuItem } from '@/app/(admin)/settings/SettingsMenuTab';
import { LoadingIcon } from '@/app/(admin)/topmenu/LoadingIcon';
import { LoginInfo } from '@/app/(admin)/topmenu/LoginInfo';
import { BoomGate } from '@/app/icons/BoomGate';
import { LevelSlider } from '@/app/icons/LevelSlider';
import { useIsMounted } from '@/hooks/useIsMounted';
import { useMobile } from '@/hooks/useMobile';
import { useSvrConf } from '@/store/useSvrConf';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import DisplaySettingsIcon from '@mui/icons-material/DisplaySettings';
//import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
//import SettingsIcon from '@mui/icons-material/Settings';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { Box, Tabs } from '@mui/material';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { GiCctvCamera } from 'react-icons/gi';

export type SettingPaths =
  //| '/settings/web'
  | '/settings/camera'
  | '/settings/ebrd'
  | '/settings/emcall'
  | '/settings/water'
  | '/settings/gate'
  | '/settings/alm'
  //| '/settings/login'
  | '/settings/inst'
  //| '/settings/board'
  | '/settings/admin';

type Props = {};
export const SettingsMenu = (_props: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const grpDepth = useGrpDepth();

  const [value, setValue] = React.useState<string>('');

  useEffect(() => {
    if (pathname === '/settings') {
      router.push('/settings/admin');
      setValue('/settings/admin');
    } else {
      setValue(location.pathname);
    }
  }, [router, pathname]);

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
    router.push(newValue);
  };
  const { isInst } = useLoginRole();

  const hasAuth = (path: SettingPaths) => {
    if (path === '/settings/inst') {
      //return grpDepth === 0 && (isAdmin || isInst);
      return grpDepth === 1 && isInst;
    }
    // else if (path === '/settings/login') {
    //   return isAdmin || isInst;
    // } else if (path === '/settings/board') {
    //   return isAdmin || isInst;
    // }
    return false;
  };

  const getTabValue = (path: SettingPaths) => {
    if (!path) {
      return false;
    }
    if (path.startsWith('/settings/ebrd')) {
      // 전광판 하위메뉴까지 선택되도록.
      return '/settings/ebrd';
    } else if (path.startsWith('/settings/admin')) {
      // 관리자 하위메뉴까지 선택되도록.
      return '/settings/admin';
    } else if (path.startsWith('/settings/emcall')) {
      // 비상통화장치 하위메뉴까지 선택되도록.
      return '/settings/emcall';
    } else if (path.startsWith('/settings/gate')) {
      // 차단장비 하위메뉴까지 선택되도록.
      return '/settings/gate';
    } else if (path.startsWith('/settings/inst')) {
      // 설치 하위메뉴까지 선택되도록. ==>
      if (!hasAuth('/settings/inst')) {
        return false;
      }
      return '/settings/inst';
      // } else if (path.startsWith('/settings/login')) {
      //   if (!hasAuth('/settings/login')) {
      //     return false;
      //   }
      // } else if (path.startsWith('/settings/board')) {
      //   // 게시판 하위메뉴까지 선택되도록.
      //   if (!hasAuth('/settings/board')) {
      //     return false;
      //   }
      //   return '/settings/board';
    }
    return path;
  };

  const { svrConf } = useSvrConf();

  const { isMobile } = useMobile();
  const mounted = useIsMounted();

  if (!mounted) {
    return (
      <Box sx={{ backgroundColor: '#eee', display: 'flex' }}>
        <Tabs
          value={getTabValue(value as SettingPaths)}
          onChange={handleChange}
          aria-label='설정 메뉴'
          variant='scrollable'
          scrollButtons='auto'
          allowScrollButtonsMobile
        ></Tabs>
      </Box>
    );
  }
  return (
    <Box sx={{ backgroundColor: '#eee', display: 'flex' }}>
      <Tabs
        value={getTabValue(value as SettingPaths)}
        onChange={handleChange}
        aria-label='설정 메뉴'
        variant='scrollable'
        scrollButtons='auto'
        //allowScrollButtonsMobile
      >
        {/* <SettingsMenuItem mui value='/settings/web' label='웹 설정' comp={TuneIcon} /> */}
        <SettingsMenuItem
          mui={true}
          value='/settings/admin'
          label='관리자'
          comp={SupervisorAccountIcon}
        />
        <SettingsMenuItem mui={false} value='/settings/camera' label='카메라' comp={GiCctvCamera} />
        <SettingsMenuItem
          mui={false}
          value='/settings/ebrd'
          label='전광판'
          comp={DisplaySettingsIcon}
        />
        <SettingsMenuItem
          mui={true}
          value='/settings/emcall'
          label='비상통화장치'
          comp={VolumeUpIcon}
        />
        <SettingsMenuItem mui={false} value='/settings/water' label='수위계' comp={LevelSlider} />
        <SettingsMenuItem mui={false} value='/settings/gate' label='차단장비' comp={BoomGate} />
        {svrConf.sms_enable && (
          <SettingsMenuItem
            mui={true}
            value='/settings/alm'
            label='경보설정'
            comp={NotificationsActiveIcon}
          />
        )}
        {/* <SettingsMenuItem
          mui={true}
          value='/settings/group'
          label='차단장비그룹'
          comp={FolderSpecialIcon}
        /> */}
        {/* {hasAuth('/settings/login') && (
          <SettingsMenuItem
            mui={true}
            value='/settings/login'
            label='계정관리'
            comp={ManageAccountsIcon}
          />
        )} */}

        {hasAuth('/settings/inst') && (
          <SettingsMenuItem
            mui={true}
            value='/settings/inst'
            label='운영설정'
            comp={AdminPanelSettingsIcon}
          />
        )}
        {/* 운영설정 밑에 넣으면 메뉴 단계가 너무 깊어져서 운영설정과 같은 레벨에 넣음 */}
        {/* {hasAuth('/settings/board') && (
          <SettingsMenuItem
            mui={true}
            value='/settings/board'
            label='게시판관리'
            comp={ArticleIcon}
          />
        )} */}
      </Tabs>
      {!isMobile && (
        <>
          <Box flexGrow={1} />
          <Box sx={{ display: 'flex', alignItems: 'center', paddingRight: 1 }}>
            <LoadingIcon />
            <LoginInfo color='#000' />
          </Box>
        </>
      )}
    </Box>
  );
};
