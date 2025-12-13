'use client';

import { listStyles } from '@/app/(admin)/settings/comp/commStyles';
import { FormEbrdDetail } from '@/app/(admin)/settings/ebrd/detail/FormEbrdDetail';
import { FormEbrdList } from '@/app/(admin)/settings/ebrd/detail/FormEbrdList';
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
          <FormEbrdList sel={sel} setSel={setSel} />
        </Box>
        <Box sx={listStyles.listBox}>
          <FormEbrdDetail sel={sel} setSel={setSel} />
        </Box>
      </Box>
    </Box>
  );
};

export default EbrdMsgPage;
