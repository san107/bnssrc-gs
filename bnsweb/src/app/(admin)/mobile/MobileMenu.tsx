'use client';

import { useState } from 'react';
import { useLoginInfo, useLoginRole } from '@/app/(admin)/leftmenu/useLoginInfo';
import {
  AppBar,
  Box,
  Drawer,
  Divider,
  IconButton,
  ListItemText,
  ListItemIcon,
  MenuList,
  MenuItem,
  Paper,
  Toolbar,
} from '@mui/material';

import { Logout, Settings, Close } from '@mui/icons-material';
import MenuIcon from '@mui/icons-material/Menu';
// import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PublicIcon from '@mui/icons-material/Public';
import ShareIcon from '@mui/icons-material/Share';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useStore } from '@/store/useStore';
import { useMobile } from '@/hooks/useMobile';

export const MobileMenu = () => {
  const { isMobile } = useMobile();
  const [isOpenMenu, setIsOpenMenu] = useState<boolean>(false);
  const { logout } = useLoginInfo();
  const mainImage = useStore(useSettingsStore, (state) => {
    return state.mainImage;
  });

  const { hasAuth } = useLoginRole();

  if (!isMobile) return null;

  const handleClickMenu = (url: string) => {
    setIsOpenMenu(false);
    window.location.href = url;
  };

  return (
    <>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar
          position='static'
          sx={{
            background: 'linear-gradient(45deg, #1976D2 30%, #1565C0 90%)',
            boxShadow: '0 3px 5px 2px rgba(25, 118, 210, .3)',
          }}
        >
          <Toolbar>
            <IconButton
              size='large'
              edge='start'
              color='inherit'
              aria-label='menu'
              sx={{
                mr: 2,
                '&:hover': {
                  transform: 'scale(1.1)',
                  transition: 'transform 0.2s',
                },
              }}
              onClick={() => setIsOpenMenu(true)}
            >
              <MenuIcon />
            </IconButton>
            {mainImage ? (
              <img
                src={mainImage}
                alt='bns tech logo'
                className='m-logo-bright'
                style={{ maxHeight: '40px', transition: 'transform 0.3s' }}
              />
            ) : (
              <img
                src='/images/bnstech-logo2.png'
                alt='bns tech logo'
                className='m-logo-bright'
                style={{ maxHeight: '40px', transition: 'transform 0.3s' }}
              />
            )}
          </Toolbar>
        </AppBar>
      </Box>
      <Drawer
        anchor='left'
        open={isOpenMenu}
        onClose={() => setIsOpenMenu(false)}
        ModalProps={{
          keepMounted: true,
          container: document.body,
          style: { zIndex: 99999 },
        }}
        sx={{
          '& .MuiDrawer-paper': {
            width: '240px',
            color: '#e0f0f0',
            background: 'linear-gradient(180deg, #ecf2fc 0%, #c3cfe2 100%)',
          },
        }}
      >
        <Paper
          sx={{
            width: 240,
            maxWidth: '100%',
            background: 'transparent',
            boxShadow: 'none',
          }}
        >
          <Box
            className='relative'
            sx={{
              paddingTop: 2,
              paddingBottom: 2,
              background: 'linear-gradient(45deg, #1976D2 30%, #1565C0 90%)',
              boxShadow: '0 3px 5px 2px rgba(25, 118, 210, .3)',
              transition: 'transform 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 16px 16px 30px',
              position: 'relative',
            }}
          >
            {mainImage ? (
              <img
                src={mainImage}
                alt='bns tech logo'
                className='m-logo-bright'
                style={{ maxWidth: '70%', display: 'block', cursor: 'pointer' }}
                onClick={() => document.location.reload()}
              />
            ) : (
              <img
                src='/images/bnstech-logo2.png'
                alt='bns tech logo'
                className='m-logo-bright'
                style={{ maxWidth: '70%', display: 'block', cursor: 'pointer' }}
                onClick={() => document.location.reload()}
              />
            )}
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                setIsOpenMenu(false);
              }}
              sx={{
                color: 'white',
                '&:hover': {
                  transform: 'scale(1.1)',
                },
              }}
            >
              <Close />
            </IconButton>
          </Box>
          <MenuList>
            <MenuItem
              onClick={() => handleClickMenu('/')}
              sx={{
                margin: '4px 8px',
                borderRadius: '8px',
                '&:hover': {
                  background: 'rgba(33, 150, 243, 0.1)',
                },
              }}
            >
              <ListItemIcon>
                <PublicIcon fontSize='small' />
              </ListItemIcon>
              <ListItemText>GIS</ListItemText>
            </MenuItem>
            <MenuItem
              onClick={() => handleClickMenu('/dashbd/dark')}
              sx={{
                margin: '4px 8px',
                borderRadius: '8px',
                '&:hover': {
                  background: 'rgba(33, 150, 243, 0.1)',
                },
              }}
            >
              <ListItemIcon>
                <DashboardIcon fontSize='small' />
              </ListItemIcon>
              <ListItemText>대시보드</ListItemText>
            </MenuItem>
            {process.env.NEXT_PUBLIC_YEONGWOL === 'Y' && (
              <MenuItem
                onClick={() => handleClickMenu('/dashbd/weather')}
                sx={{
                  margin: '4px 8px',
                  borderRadius: '8px',
                  '&:hover': {
                    background: 'rgba(33, 150, 243, 0.1)',
                  },
                }}
              >
                <ListItemIcon>
                  <BeachAccessIcon fontSize='small' />
                </ListItemIcon>
                <ListItemText>강우량</ListItemText>
              </MenuItem>
            )}
            <Divider sx={{ margin: '8px 0', background: 'rgba(0, 0, 0, 0.1)' }} />
            {hasAuth('Admin') && (
              <MenuItem
                onClick={() => handleClickMenu('/ndms')}
                sx={{
                  margin: '4px 8px',
                  borderRadius: '8px',
                  '&:hover': {
                    background: 'rgba(33, 150, 243, 0.1)',
                  },
                }}
              >
                <ListItemIcon>
                  <ShareIcon fontSize='small' />
                </ListItemIcon>
                <ListItemText>NDMS</ListItemText>
              </MenuItem>
            )}
            {hasAuth('Inst') && (
              <MenuItem
                onClick={() => handleClickMenu('/settings')}
                sx={{
                  margin: '4px 8px',
                  borderRadius: '8px',
                  '&:hover': {
                    background: 'rgba(33, 150, 243, 0.1)',
                  },
                }}
              >
                <ListItemIcon>
                  <Settings fontSize='small' />
                </ListItemIcon>
                <ListItemText>환경설정</ListItemText>
              </MenuItem>
            )}
            {hasAuth('Inst') && (
              <Divider sx={{ margin: '8px 0', background: 'rgba(0, 0, 0, 0.1)' }} />
            )}
            <MenuItem
              onClick={(e) => {
                e.preventDefault();
                logout();
              }}
              sx={{
                margin: '4px 8px',
                borderRadius: '8px',
                '&:hover': {
                  background: 'rgba(255, 0, 0, 0.1)',
                },
              }}
            >
              <ListItemIcon>
                <Logout fontSize='small' />
              </ListItemIcon>
              <ListItemText>로그아웃</ListItemText>
            </MenuItem>
          </MenuList>
        </Paper>
      </Drawer>
    </>
  );
};
