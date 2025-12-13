'use client';
import { SubMenuItem } from '@/app/(admin)/comp/menu/SubMenuItem';
// @flow
// import AccountTreeIcon from '@mui/icons-material/AccountTree';
import FolderSharedIcon from '@mui/icons-material/FolderShared';
import MonitorIcon from '@mui/icons-material/Monitor';
// import TerminalIcon from '@mui/icons-material/Terminal';
import CodeIcon from '@mui/icons-material/Code';
import { Box, Tabs } from '@mui/material';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import WbSunnyIcon from '@mui/icons-material/WbSunny';

type Props = {};
export const InstMenu = (_props: Props) => {
  const router = useRouter();
  const pathname = usePathname();

  const [value, setValue] = React.useState<string>('');

  useEffect(() => {
    if (pathname === '/settings/inst') {
      setValue('/settings/inst/dept');
    } else {
      setValue(pathname);
    }
  }, [pathname]);

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
    router.push(newValue);
    //console.log('newvalue ', newValue);
  };
  //const { isAdmin } = useLoginRole();
  return (
    <Box sx={{ backgroundColor: '#f0f0f0', borderTop: '1px solid #ccc' }}>
      <Tabs
        value={value ? value : false}
        onChange={handleChange}
        aria-label='관리자 메뉴'
        variant='scrollable'
        scrollButtons='auto'
        allowScrollButtonsMobile
        sx={{ minHeight: '32px' }}
      >
        <SubMenuItem
          mui={false}
          value='/settings/inst/dept'
          label='부서관리'
          comp={FolderSharedIcon}
        />

        <SubMenuItem mui={false} value='/settings/inst/code' label='코드관리' comp={CodeIcon} />
        <SubMenuItem mui={false} value='/settings/inst/ncode' label='N코드관리' comp={CodeIcon} />
        <SubMenuItem mui={false} value='/settings/inst/disp' label='화면설정' comp={MonitorIcon} />
        <SubMenuItem mui value='/settings/inst/weather' label='날씨지역' comp={WbSunnyIcon} />
      </Tabs>
    </Box>
  );
};
