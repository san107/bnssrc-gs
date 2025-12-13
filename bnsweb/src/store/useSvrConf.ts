'use client';
import { IfSvrInfo, SvrInfo } from '@/models/tb_config';
import { get_err_msg } from '@/utils/err-util';
import axios from 'axios';
import { useCallback } from 'react';
import { toast } from 'sonner';
import { create } from 'zustand';

export const useSvrConfStore = create<{
  setSvrConf: (v: IfSvrInfo) => void;
  svrConf: IfSvrInfo;
}>((set) => ({
  setSvrConf: (v: IfSvrInfo) => {
    if (typeof window === 'undefined') {
      return;
    }
    localStorage.setItem('svr_conf', JSON.stringify(v));
    set({ svrConf: v });
  },
  svrConf:
    typeof window !== 'undefined' && localStorage.getItem('svr_conf')
      ? JSON.parse(localStorage.getItem('svr_conf') || '{}')
      : new SvrInfo(),
}));

export const useSvrConf = (): {
  svrConf: IfSvrInfo;
  saveSmsEnable: (sms_enable: boolean, showToast?: boolean) => void;
  getSvrConf: () => void;
  loadSvrConf: () => void;
} => {
  const { svrConf, setSvrConf } = useSvrConfStore();

  const loadSvrConf = useCallback(() => {
    const svrConf = JSON.parse(localStorage.getItem('svr_conf') || '{}');
    setSvrConf(svrConf);
  }, [setSvrConf]);

  const getSvrConf = useCallback(() => {
    axios
      .get('/api/config/svr')
      .then((res) => {
        if (res.status === 200) {
          setSvrConf(res.data || new SvrInfo());
        } else {
          setSvrConf(new SvrInfo());
        }
      })
      .catch((err) => {
        console.log(err);
        setSvrConf(new SvrInfo());
      });
  }, [setSvrConf]);

  const saveSmsEnable = useCallback(
    (sms_enable: boolean, showToast: boolean = false) => {
      axios
        .post('/api/config/setenv', {
          key: 'SMS_ENABLE',
          value: sms_enable.toString(),
        })
        .then((res) => {
          if (res.status === 200) {
            if (showToast) {
              toast.success('시스템 설정을 저장하였습니다.');
            }
            return getSvrConf();
          }
        })
        .catch((err) => {
          console.log(err);
          if (showToast) {
            toast.error('시스템 설정을 저장하는데 실패하였습니다.' + get_err_msg(err));
          }
        });
    },
    [getSvrConf]
  );

  return { svrConf, saveSmsEnable, getSvrConf, loadSvrConf };
};
