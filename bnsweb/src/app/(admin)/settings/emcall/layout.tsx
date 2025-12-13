import { EmcallMenu } from '@/app/(admin)/settings/emcall/menu/EmcallMenu';
import { Box } from '@mui/material';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Box
      sx={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#f9f9f9' }}
    >
      <EmcallMenu />
      {children}
    </Box>
  );
}
