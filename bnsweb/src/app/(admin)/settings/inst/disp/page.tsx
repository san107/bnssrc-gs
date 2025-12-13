'use client';

import { SetDashboard } from '@/app/(admin)/settings/inst/disp/SetDashboard';
import { SetLeft } from '@/app/(admin)/settings/inst/disp/SetLeft';
import { Box } from '@mui/material';

export default function DisplayIndex() {
  return (
    <>
      <Box sx={{ padding: 2, flexGrow: 1 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 2,
            height: '100%',
          }}
        >
          <Box sx={{ width: { xs: '100%', md: '50%' } }}>
            <SetLeft />
          </Box>
          <Box sx={{ width: { xs: '100%', md: '50%' } }}>
            <SetDashboard />
          </Box>
        </Box>
      </Box>
    </>
  );
}
