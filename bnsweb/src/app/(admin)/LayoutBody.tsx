'use client';
import { MobileMenu } from '@/app/(admin)/mobile/MobileMenu';
import { Box } from '@mui/material';

export default function LayoutBody({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Box sx={{ width: '1px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Box>
          <MobileMenu />
        </Box>
        <Box sx={{ height: '1px', flexGrow: 1 }}>{children}</Box>
      </Box>
    </>
  );
}
