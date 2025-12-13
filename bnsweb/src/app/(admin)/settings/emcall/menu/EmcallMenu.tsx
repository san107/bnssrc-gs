'use client';
import { SubMenuItem } from '@/app/(admin)/comp/menu/SubMenuItem';
import { VolumeUpOutlined } from '@mui/icons-material';

import { Box, Tabs } from '@mui/material';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { PiBellRinging } from 'react-icons/pi';

type Props = {};
export const EmcallMenu = (_props: Props) => {
  const router = useRouter();
  const pathname = usePathname();

  const [value, setValue] = React.useState<string>('');

  useEffect(() => {
    if (pathname === '/settings/emcall') {
      setValue('/settings/emcall/grp');
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
        aria-label='비상통화장치 메뉴'
        variant='scrollable'
        scrollButtons='auto'
        allowScrollButtonsMobile
        sx={{ minHeight: '32px' }}
      >
        <SubMenuItem
          mui={false}
          value='/settings/emcall/grp'
          // label='비상통화장치 송출그룹'
          label='스피커 송출그룹'
          comp={VolumeUpOutlined}
        />

        <SubMenuItem
          mui={false}
          value='/settings/emcall/list'
          // label='비상통화장치'
          label='비상벨 수신'
          comp={PiBellRinging}
        />
      </Tabs>
    </Box>
  );
};
