'use client';
import { SubMenuItem } from '@/app/(admin)/comp/menu/SubMenuItem';
import { BoomGate } from '@/app/icons/BoomGate';
import FolderSpecialIcon from '@mui/icons-material/FolderSpecial';
import { Box, Tabs } from '@mui/material';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

type Props = {};
export const GateMenu = (_props: Props) => {
  const router = useRouter();
  const pathname = usePathname();

  const [value, setValue] = React.useState<string>('');

  useEffect(() => {
    if (pathname === '/settings/gate') {
      setValue('/settings/gate/list');
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
        aria-label='차단장비'
        variant='scrollable'
        scrollButtons='auto'
        allowScrollButtonsMobile
        sx={{ minHeight: '32px' }}
      >
        <SubMenuItem
          mui={false}
          value='/settings/gate/list'
          // label='비상통화장치 송출그룹'
          label='차단장비'
          comp={BoomGate}
        />

        <SubMenuItem
          mui={false}
          value='/settings/gate/group'
          // label='비상통화장치'
          label='차단장비그룹'
          comp={FolderSpecialIcon}
        />
      </Tabs>
    </Box>
  );
};
