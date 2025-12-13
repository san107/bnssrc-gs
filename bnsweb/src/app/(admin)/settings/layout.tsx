'use client';
import { ProtectedComponent } from '@/abilities/abilities';
import { SettingsMenu } from '@/app/(admin)/settings/SettingsMenu';
import { gconf } from '@/utils/gconf';
import { Box } from '@mui/material';
import { useEffect } from 'react';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    (window as any).gconf = gconf;
  }, []);
  return (
    <ProtectedComponent action='view' subject='settings'>
      <Box
        sx={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#f9f9f9',
          overflowX: 'auto',
        }}
      >
        <SettingsMenu />
        {children}
      </Box>
    </ProtectedComponent>
  );
}
