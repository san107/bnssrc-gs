'use client';
// @flow

import { LoadingIcon } from '@/app/(admin)/topmenu/LoadingIcon';
import { LoginInfo } from '@/app/(admin)/topmenu/LoginInfo';
import {
  TopMenuInfoFalse,
  TopMenuInfoTrue,
  useTopMenuStore,
} from '@/app/(admin)/topmenu/useTopMenuInfoStore';
import { BoomGate } from '@/app/icons/BoomGate';
import { LevelSlider } from '@/app/icons/LevelSlider';
import { useMobile } from '@/hooks/useMobile';
import DisplaySettingsIcon from '@mui/icons-material/DisplaySettings';
import RestoreIcon from '@mui/icons-material/Restore';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import CloseIcon from '@mui/icons-material/Close';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import clsx from 'clsx';
import { GiCctvCamera } from 'react-icons/gi';
import { NoticeTicker } from '@/app/(admin)/comp/display/NoticeTicker';
import { useSysConf } from '@/store/useSysConf';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type Props = {};
type Mode = 'camera' | 'ebrd' | 'emcall' | 'emcallgrp' | 'gate' | 'water' | 'all' | 'none';

export const TopMenu = ({}: Props) => {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('all');
  const sparam = useSearchParams();
  const { topMenuInfo, setTopMenuInfo } = useTopMenuStore();
  const { isMobile } = useMobile();
  const { sysConf } = useSysConf();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const m = sparam.get('mode');
    if (m) {
      setMode(m as Mode);
    } else {
      setMode('all');
    }
  }, [sparam]);

  useEffect(() => {
    const def = new TopMenuInfoFalse();
    if (mode === 'none') {
      setTopMenuInfo(new TopMenuInfoFalse());
    } else if (mode === 'all') {
      setTopMenuInfo(new TopMenuInfoTrue());
    } else if (mode === 'camera') {
      setTopMenuInfo({ ...def, camera: true });
    } else if (mode === 'ebrd') {
      setTopMenuInfo({ ...def, ebrd: true });
    } else if (mode === 'emcall') {
      setTopMenuInfo({ ...def, emcall: true });
    } else if (mode === 'emcallgrp') {
      setTopMenuInfo({ ...def, emcallgrp: true });
    } else if (mode === 'gate') {
      setTopMenuInfo({ ...def, gate: true });
    } else if (mode === 'water') {
      setTopMenuInfo({ ...def, water: true });
    } else {
      setTopMenuInfo(new TopMenuInfoTrue()); // 기본 모든 메뉴 표시.
    }
  }, [mode, setTopMenuInfo]);

  const isCamera = sysConf?.use_camera_yn === 'Y';
  const isGate = sysConf?.use_gate_yn === 'Y';
  const isWater = sysConf?.use_water_yn === 'Y';
  const isEbrd = sysConf?.use_ebrd_yn === 'Y';
  const isEmcall = sysConf?.use_emcall_yn === 'Y';
  const isEmcallGrp = sysConf?.use_emcall_grp_yn === 'Y';

  const isAllOn =
    topMenuInfo.camera &&
    topMenuInfo.gate &&
    topMenuInfo.water &&
    topMenuInfo.emcall &&
    topMenuInfo.ebrd;

  const handleMenuClick = (callback: () => void) => {
    callback();
    if (isMobile) {
      setIsMenuOpen(false);
    }
  };

  const renderMenuItems = () => (
    <>
      <Menu
        className={clsx({ on: isAllOn })}
        onClick={() =>
          handleMenuClick(() =>
            isAllOn ? router.replace('?mode=none') : router.replace('?mode=all')
          )
        }
      >
        <Icon>
          <RestoreIcon sx={{ fontSize: '1.3em' }} />
        </Icon>
        전체보기
      </Menu>
      {!isMobile && isCamera && (
        <Menu
          onClick={() => handleMenuClick(() => router.replace('?mode=camera'))}
          className={clsx({ on: topMenuInfo.camera })}
        >
          <Icon>
            <GiCctvCamera />
          </Icon>
          카메라
        </Menu>
      )}
      {isEbrd && (
        <Menu
          onClick={() => handleMenuClick(() => router.replace('?mode=ebrd'))}
          className={clsx({ on: topMenuInfo.ebrd })}
        >
          <Icon>
            <DisplaySettingsIcon />
          </Icon>
          전광판
        </Menu>
      )}
      {isEmcallGrp && (
        <Menu
          onClick={() => handleMenuClick(() => router.replace('?mode=emcallgrp'))}
          className={clsx({ on: topMenuInfo.emcallgrp })}
        >
          <Icon>
            <VolumeUpIcon />
          </Icon>
          송출그룹
        </Menu>
      )}
      {isEmcall && (
        <Menu
          onClick={() => handleMenuClick(() => router.replace('?mode=emcall'))}
          className={clsx({ on: topMenuInfo.emcall })}
        >
          <Icon>
            <NotificationsActiveIcon />
          </Icon>
          비상벨
        </Menu>
      )}

      {isGate && (
        <Menu
          onClick={() => handleMenuClick(() => router.replace('?mode=gate'))}
          className={clsx({ on: topMenuInfo.gate })}
        >
          <Icon>
            <BoomGate />
          </Icon>
          차단장비
        </Menu>
      )}
      {isWater && (
        <Menu
          onClick={() => handleMenuClick(() => router.replace('?mode=water'))}
          className={clsx({ on: topMenuInfo.water })}
        >
          <Icon>
            <LevelSlider />
          </Icon>
          수위계
        </Menu>
      )}
    </>
  );

  return (
    <>
      <Body>
        {isMobile ? (
          <>
            <MenuButton onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <MenuOpenIcon />
            </MenuButton>
            <NoticeTicker />
            <Box sx={{ flexGrow: 1 }} />
            <LoadingIcon />
            <LoginInfo />
          </>
        ) : (
          <>
            {renderMenuItems()}
            <NoticeTicker />
            <Box sx={{ flexGrow: 1 }} />
            <LoadingIcon />
            <LoginInfo />
          </>
        )}
      </Body>
      {isMobile && isMenuOpen && (
        <MobileMenuContainer>
          <MenuHeader>
            <Box>메뉴</Box>
            <CloseButton onClick={() => setIsMenuOpen(false)}>
              <CloseIcon />
            </CloseButton>
          </MenuHeader>
          {renderMenuItems()}
        </MobileMenuContainer>
      )}
    </>
  );
};

const Icon = styled(Box)`
  padding-right: 3px;
  display: flex;
  align-items: center;
`;

const MenuButton = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  cursor: pointer;
  color: #fff;
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const Menu = styled(Box)`
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  margin: 0 2px;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 700;
  background-color: #162a5c;
  color: #ccc;
  user-select: none;
  cursor: pointer;
  &:hover {
    background-color: #2a4da6;
  }
  &.on {
    color: white;
    background-color: #3561d6;
    &:hover {
      color: white;
      background-color: #2a4da6;
    }
  }
  &.off {
    color: #ccc;
  }
`;

const Body = styled(Box)`
  position: relative;
  display: flex;
  overflow-x: auto;
  align-items: center;
  background-color: #1f397b;
  color: #fff;
  height: 40px;
  z-index: 9998;
`;

const MobileMenuContainer = styled(Box)`
  position: fixed;
  top: 57px;
  left: 0;
  width: 200px;
  background-color: #1f397b;
  padding: 4px 4px 10px 4px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  z-index: 9999;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 0 0 4px 0;
`;

const MenuHeader = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 3px 4px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 4px;
  color: #fff;
`;

const CloseButton = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
  cursor: pointer;
  color: #fff;
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }
`;
