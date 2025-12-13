'use client';

/** @jsxImportSource @emotion/react */

import { Box, Card } from '@mui/material';
import { AlmSett } from '@/app/(admin)/settings/alm/AlmSett';
import { AlmUserList } from '@/app/(admin)/settings/alm/AlmUserList';
import Loading from '@/app/(admin)/settings/alm/loading';
import { IfTbAlmUser, TbAlmUser } from '@/models/tb_alm_user';
import useSWR from 'swr';
import { useState } from 'react';
import { IfTbWater } from '@/models/water/tb_water';

type Props = {};

const GateIndex = (_props: Props) => {
  const { data: users, isLoading: isLoading1 } = useSWR<IfTbAlmUser[]>(['/api/alm_user/list']);
  const { data: waters, isLoading: isLoading2 } = useSWR<IfTbWater[]>(['/api/water/list']);

  const [selUser, setSelUser] = useState<IfTbAlmUser>(new TbAlmUser());
  return (
    <Box sx={{ padding: 2, flexGrow: 1 }}>
      {isLoading1 || isLoading2 ? (
        <Card sx={{ padding: 2, height: '100%', width: '100%', display: 'flex' }}>
          <Loading />
        </Card>
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 2,
            height: '100%',
          }}
        >
          <Box sx={{ width: { xs: '100%', md: '50%' } }}>
            <AlmUserList list={users} sel={selUser} setSel={setSelUser} />
          </Box>
          <Box sx={{ width: { xs: '100%', md: '50%' } }}>
            <AlmSett list={waters} selUser={selUser} />
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default GateIndex;
