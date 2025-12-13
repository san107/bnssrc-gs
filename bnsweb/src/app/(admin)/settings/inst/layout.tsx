'use client';
import { ProtectedComponent } from '@/abilities/abilities';
import { InstMenu } from '@/app/(admin)/settings/inst/menu/InstMenu';
import { Box } from '@mui/material';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ProtectedComponent action='view' subject='inst'>
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#f9f9f9',
        }}
      >
        <InstMenu />
        {children}
      </Box>
    </ProtectedComponent>
  );
}
