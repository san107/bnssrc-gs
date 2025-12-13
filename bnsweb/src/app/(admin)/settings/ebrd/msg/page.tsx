'use client';

import { listStyles } from '@/app/(admin)/settings/comp/commStyles';
import { EbrdMsg } from '@/app/(admin)/settings/ebrd/msg/EbrdMsg';
import { EbrdList } from '@/app/(admin)/settings/ebrd/msg/EbrdList';
import { TbEbrd } from '@/models/ebrd/tb_ebrd';
import { Box } from '@mui/material';
import { useState } from 'react';

type Props = {};

const EbrdMsgPage = (_props: Props) => {
  const [sel, setSel] = useState(new TbEbrd());
  return (
    <Box sx={listStyles.rootBox}>
      <Box sx={listStyles.contentBox}>
        <Box sx={listStyles.formBox450}>
          <EbrdList sel={sel} setSel={setSel} />
        </Box>
        <Box sx={listStyles.listBox}>
          <EbrdMsg sel={sel} setSel={setSel} />
        </Box>
      </Box>
    </Box>
  );
};

export default EbrdMsgPage;
