// @flow
import { IfTbGateEmcall } from '@/models/gate/tb_gate_emcall';
import { eqSet } from '@/utils/math-utils';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import useSWR from 'swr';

type Props = {
  gateSeq: number | undefined;
};
export const useApiGateEmcall = ({
  gateSeq,
}: Props): {
  gateEmcalls: IfTbGateEmcall[];
  setGateEmcalls: (v: IfTbGateEmcall[]) => void;
  saveEmcalls: (p: { gateSeq: number }) => Promise<void>;
} => {
  const { data: list } = useSWR<IfTbGateEmcall[]>(
    !!gateSeq && [`/api/gate_emcall/list`, { gateSeq }]
  );
  const [gateEmcalls, setGateEmcalls] = useState<IfTbGateEmcall[]>([]);
  useEffect(() => {
    setGateEmcalls((list || []).map((ele) => ({ ...ele })));
  }, [list]);

  const isEmcallsEqual = useCallback((): boolean => {
    const s1 = new Set((list || []).map((ele) => ele.emcall_seq!));
    const s2 = new Set(gateEmcalls.map((ele) => ele.emcall_seq!));
    return eqSet(s1, s2);
  }, [list, gateEmcalls]);

  const saveEmcalls = useCallback(
    ({ gateSeq }: { gateSeq: number }) => {
      return new Promise<void>((resolve, reject) => {
        if (isEmcallsEqual()) {
          resolve();
          return;
        }
        const list = gateEmcalls.map((ele) => ({ ...ele, gate_seq: gateSeq }));
        axios
          .post('/api/gate_emcall/saves', { gateSeq, list })
          .then((res) => {
            console.log('ok', res.data);
            resolve();
          })
          .catch((e) => {
            console.error('E', e);
            reject(e);
          });
      });
    },
    [isEmcallsEqual, gateEmcalls]
  );

  return {
    gateEmcalls,
    setGateEmcalls,
    saveEmcalls,
  };
};
