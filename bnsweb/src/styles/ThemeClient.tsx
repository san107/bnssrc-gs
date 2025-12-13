'use client';

import { theme } from '@/styles/ThemeConfig';
import { ThemeProvider } from '@mui/material';

export default function ThemeClient({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
