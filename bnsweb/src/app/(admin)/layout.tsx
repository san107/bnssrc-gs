import '../globals.css';
import '../scss/style.scss';

import LayoutBody from '@/app/(admin)/LayoutBody';
// import { LeftMenu } from '@/app/(admin)/leftmenu/LeftMenu';
import { AbilityProvider } from '@/abilities/AbilityProvider';
import { ModalContainer } from '@/app/(admin)/comp/popup/ModalContainer';
import { LeftMenuWrapper } from '@/app/(admin)/leftmenu/LeftMenuWrapper';
import ThemeClient from '@/styles/ThemeClient';
import '@/utils/axios-util';
import { SWRProvider } from '@/utils/swr-provider';
import { ToasterProvider } from '@/utils/toast-util';
import { Box } from '@mui/material';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { InitGlobal } from '@/app/(admin)/InitGlobal';

const geistSans = localFont({
  src: '../fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
  preload: false,
});
const geistMono = localFont({
  src: '../fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
  preload: false,
});

export const metadata: Metadata = {
  title: 'BNS GIS(LDMS)',
  description: '(주)비엔에스테크 재난안전 솔루션',
  icons: {
    icon: '/images/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeClient>
          <ToasterProvider />
          <InitGlobal />
          <AbilityProvider>
            <SWRProvider>
              <Box sx={{ width: '100vw', height: '100vh', display: 'flex' }}>
                <Box
                  sx={{
                    width: { xs: 0, md: '70px' },
                    height: '100%',
                    //backgroundColor: '#ddd',
                    backgroundColor: '#2e4a8f',
                    display: { xs: 'none', md: 'block' },
                  }}
                >
                  <LeftMenuWrapper />
                </Box>
                <LayoutBody>{children}</LayoutBody>
              </Box>
              <ModalContainer />
            </SWRProvider>
          </AbilityProvider>
        </ThemeClient>
      </body>
    </html>
  );
}
