'use client';
// @flow
import { NdmsMenuItem } from '@/app/(admin)/ndms/NdmsMenuTab';
import { LoadingIcon } from '@/app/(admin)/topmenu/LoadingIcon';
import { LoginInfo } from '@/app/(admin)/topmenu/LoginInfo';
import { useMobile } from '@/hooks/useMobile';
import TuneIcon from '@mui/icons-material/Tune';
import { Box, Tabs } from '@mui/material';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

type Props = {};
export const NdmsMenu = (_props: Props) => {
  const router = useRouter();
  const pathname = usePathname();

  const [value, setValue] = React.useState<string>('');

  useEffect(() => {
    if (pathname === '/ndms') {
      router.push('/ndms/cou_dngr_adm');
      setValue('/ndms/cou_dngr_adm');
    } else {
      setValue(location.pathname);
    }
  }, [router, pathname]);

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
    router.push(newValue);
    //console.log('newvalue ', newValue);
  };
  //const { isAdmin } = useLoginRole();
  const { isMobile } = useMobile();
  return (
    <Box sx={{ backgroundColor: '#eee', display: 'flex' }}>
      <Tabs
        value={value ? value : false}
        onChange={handleChange}
        aria-label='NDMS 메뉴'
        variant='scrollable'
        scrollButtons='auto'
        //allowScrollButtonsMobile
      >
        <NdmsMenuItem mui value='/ndms/cou_dngr_adm' label='센싱정보 관리기관' comp={TuneIcon} />
        <NdmsMenuItem mui value='/ndms/cou_dngr_almord' label='위험경보 발령' comp={TuneIcon} />
        <NdmsMenuItem mui value='/ndms/flud_almord' label='침수경보 발령' comp={TuneIcon} />
        <NdmsMenuItem mui value='/ndms/flud_spot' label='침수지점' comp={TuneIcon} />
        <NdmsMenuItem mui value='/ndms/flud_car_intrcp' label='차량제어기' comp={TuneIcon} />
        <NdmsMenuItem mui value='/ndms/flud_wal' label='수위측정소' comp={TuneIcon} />
        <NdmsMenuItem mui value='/ndms/flud_board' label='전광판' comp={TuneIcon} />
        <NdmsMenuItem mui value='/ndms/mapping' label='NDMS 연계설정' comp={TuneIcon} />
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
