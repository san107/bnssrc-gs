'use client';
import axios from 'axios';
import { useCallback } from 'react';
import { create } from 'zustand';

export class BnsEnv {
  bnssvr_base_url: string = '';
}

export interface IfBnsEnv extends BnsEnv {}

export const useBnsEnvStore = create<{
  setBnsEnv: (v: IfBnsEnv) => void;
  bnsEnv: IfBnsEnv;
}>((set) => ({
  setBnsEnv: (v: IfBnsEnv) => {
    if (typeof window === 'undefined') {
      return;
    }
    localStorage.setItem('bns_env', JSON.stringify(v));
    set({ bnsEnv: v });
  },
  bnsEnv:
    typeof window !== 'undefined' && localStorage.getItem('bns_env')
      ? JSON.parse(localStorage.getItem('bns_env') || '{}')
      : new BnsEnv(),
}));

export const useBnsEnv = (): {
  bnsEnv: IfBnsEnv;
  getBnsEnv: () => void;
} => {
  const { bnsEnv, setBnsEnv } = useBnsEnvStore();

  const getBnsEnv = useCallback(() => {
    axios.get('/api/public/env').then((res) => {
      if (res.status === 200) {
        setBnsEnv(res.data || new BnsEnv());
      } else {
        setBnsEnv(new BnsEnv());
      }
    });
  }, [setBnsEnv]);

  return { bnsEnv, getBnsEnv };
};
