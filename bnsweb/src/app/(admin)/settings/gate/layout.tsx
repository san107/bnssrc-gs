import { ProtectedComponent } from '@/abilities/abilities';
import { GateMenu } from '@/app/(admin)/settings/gate/menu/GateMenu';
import { Box } from '@mui/material';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f9f9f9',
      }}
    >
      <GateMenu />
      {children}
    </Box>
  );
}
