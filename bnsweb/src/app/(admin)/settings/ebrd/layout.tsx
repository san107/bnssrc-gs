import { EbrdMenu } from '@/app/(admin)/settings/ebrd/menu/EbrdMenu';
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
      <EbrdMenu />
      {children}
    </Box>
  );
}
