'use client';

import { gconf } from '@/utils/gconf';
import { useEffect } from 'react';

export const InitGlobal = () => {
  useEffect(() => {
    (window as any).gconf = gconf;
  }, []);
  return <></>;
};
