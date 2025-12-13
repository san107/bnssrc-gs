'use client';
import { IfTbSysConf, TbSysConf } from '@/models/tb_sys_conf';
import { get_err_msg } from '@/utils/err-util';
import axios from 'axios';
import { useCallback } from 'react';
import { toast } from 'sonner';
import { create } from 'zustand';

export const useSysConfStore = create<{
  setSysConf: (v: IfTbSysConf) => void;
  sysConf: IfTbSysConf;
}>((set) => ({
  setSysConf: (v: IfTbSysConf) => {
    if (typeof window === 'undefined') {
      return;
    }
    localStorage.setItem('sys_conf', JSON.stringify(v));
    set({ sysConf: v });
  },
  sysConf:
    typeof window !== 'undefined' && localStorage.getItem('sys_conf')
      ? JSON.parse(localStorage.getItem('sys_conf') || '{}')
      : new TbSysConf(),
}));

export const useSysConf = (): {
  sysConf: IfTbSysConf;
  saveSysConf: (sysConf: IfTbSysConf, showToast?: boolean) => void;
  getSysConf: () => void;
  loadSysConf: () => void;
} => {
  const { sysConf, setSysConf } = useSysConfStore();

  const loadSysConf = useCallback(() => {
    const sysConf = JSON.parse(localStorage.getItem('sys_conf') || '{}');
    setSysConf(sysConf);
  }, [setSysConf]);

  const getSysConf = useCallback(() => {
    axios
      .get('/api/public/sys_conf/get')
      .then((res) => {
        if (res.status === 200) {
          setSysConf(res.data || new TbSysConf());
        } else {
          setSysConf(new TbSysConf());
        }
      })
      .catch((err) => {
        console.log(err);
        setSysConf(new TbSysConf());
      });
  }, [setSysConf]);

  const saveSysConf = useCallback(
    (sysConf: IfTbSysConf, showToast: boolean = false) => {
      axios
        .post('/api/sys_conf/save', sysConf)
        .then((res) => {
          if (res.status === 200) {
            setSysConf(res.data);
            if (showToast) {
              toast.success('시스템 설정을 저장하였습니다.');
            }
          }
        })
        .catch((err) => {
          console.log(err);
          if (showToast) {
            toast.error('시스템 설정을 저장하는데 실패하였습니다.' + get_err_msg(err));
          }
        });
    },
    [setSysConf]
  );

  return { sysConf, saveSysConf, getSysConf, loadSysConf };
};
