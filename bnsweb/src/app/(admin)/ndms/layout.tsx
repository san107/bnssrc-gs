'use client';
import { ProtectedComponent } from '@/abilities/abilities';
import { NdmsMenu } from '@/app/(admin)/ndms/NdmsMenu';
import { Box } from '@mui/material';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ProtectedComponent action='view' subject='ndms'>
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#f9f9f9',
        }}
      >
        <NdmsMenu />
        {children}
      </Box>
    </ProtectedComponent>
  );
}
