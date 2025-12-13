//"use client";
import '../globals.css';
import '../scss/style.scss';

import { Nav } from '@/app/(tests)/Nav';
import ThemeClient from '@/styles/ThemeClient';
import { SWRProvider } from '@/utils/swr-provider';
import { ToasterProvider } from '@/utils/toast-util';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import '@/utils/axios-util';

const geistSans = localFont({
  src: '../fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: '../fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'TEST - BNS GIS',
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
          <SWRProvider>
            <Nav />
            {children}
          </SWRProvider>
        </ThemeClient>
      </body>
    </html>
  );
}
