'use client';

import { useEffect, useState } from 'react';
import { LeftMenu } from '@/app/(admin)/leftmenu/LeftMenu';

export const LeftMenuWrapper = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  return <LeftMenu />;
};
