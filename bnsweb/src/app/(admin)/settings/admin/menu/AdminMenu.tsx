'use client';
import { SubMenuItem } from '@/app/(admin)/comp/menu/SubMenuItem';
import { useLoginRole } from '@/app/(admin)/leftmenu/useLoginInfo';
import { useIsMounted } from '@/hooks/useIsMounted';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import TuneIcon from '@mui/icons-material/Tune';
import { Box, Tabs } from '@mui/material';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

export type AdminPaths = '/settings/admin/web' | '/settings/admin/notice' | '/settings/admin/login';

type Props = {};
export const AdminMenu = (_props: Props) => {
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
    if (value === '/settings/admin') return false;
    return value ? value : false;
  };
  const mounted = useIsMounted();

  const { isAdmin, isInst } = useLoginRole();

  const hasAuth = (path: AdminPaths) => {
    if (path === '/settings/admin/login') {
      return isAdmin || isInst;
    }
    return false;
  };

  if (!mounted) return;

  return (
    <Box sx={{ backgroundColor: '#f0f0f0', borderTop: '1px solid #ccc' }}>
      <Tabs
        value={getTabValue(value)}
        onChange={handleChange}
        aria-label='관리자 메뉴'
        variant='scrollable'
        scrollButtons='auto'
        allowScrollButtonsMobile
        sx={{ minHeight: '32px' }}
      >
        <SubMenuItem mui={false} value='/settings/admin/web' label='웹 설정' comp={TuneIcon} />
        <SubMenuItem
          mui={false}
          value='/settings/admin/notice'
          label='공지사항'
          comp={AssignmentIcon}
        />
        {hasAuth('/settings/admin/login') && (
          <SubMenuItem
            mui={false}
            value='/settings/admin/login'
            label='계정관리'
            comp={ManageAccountsIcon}
          />
        )}
      </Tabs>
    </Box>
  );
};
