import '../globals.css';
import '../scss/style.scss';

import type { Metadata } from 'next';
import { SWRProvider } from '@/utils/swr-provider';

export const metadata: Metadata = {
  title: 'BNS GIS',
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
      <SWRProvider>
        <body className={`login`}>{children}</body>
      </SWRProvider>
    </html>
  );
}
