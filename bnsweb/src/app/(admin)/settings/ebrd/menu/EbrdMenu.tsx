'use client';
import { SubMenuItem } from '@/app/(admin)/comp/menu/SubMenuItem';
import { AppRegistration, SendAndArchive } from '@mui/icons-material';
import DisplaySettingsIcon from '@mui/icons-material/DisplaySettings';
import { Box, Tabs } from '@mui/material';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

type Props = {};
export const EbrdMenu = (_props: Props) => {
  const router = useRouter();
  const pathname = usePathname();

  const [value, setValue] = React.useState<string>('');

  useEffect(() => {
    setValue(pathname);
  }, [pathname]);

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
    router.push(newValue);
    //console.log('newvalue ', newValue);
  };
  //const { isAdmin } = useLoginRole();
  const getTabValue = (value: string) => {
    if (value === '/settings/ebrd') return false;
    return value ? value : false;
  };
  return (
    <Box sx={{ backgroundColor: '#f0f0f0', borderTop: '1px solid #ccc' }}>
      <Tabs
        value={getTabValue(value)}
        onChange={handleChange}
        aria-label='전광판 메뉴'
        variant='scrollable'
        scrollButtons='auto'
        allowScrollButtonsMobile
        sx={{ minHeight: '32px' }}
      >
        <SubMenuItem
          mui={false}
          value='/settings/ebrd/regist'
          label='전광판관리'
          comp={DisplaySettingsIcon}
        />
        <SubMenuItem
          mui={false}
          value='/settings/ebrd/msg'
          label='메시지등록'
          comp={AppRegistration}
        />
        <SubMenuItem
          mui={false}
          value='/settings/ebrd/detail'
          label='전광판상세/전송'
          comp={SendAndArchive}
        />
      </Tabs>
    </Box>
  );
};
