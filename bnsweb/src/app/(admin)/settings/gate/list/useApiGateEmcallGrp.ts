// @flow
import { IfTbGateEmcallGrp } from '@/models/gate/tb_gate_emcall_grp';
import { eqSet } from '@/utils/math-utils';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import useSWR from 'swr';

type Props = {
  gateSeq: number | undefined;
};
export const useApiGateEmcallGrp = ({
  gateSeq,
}: Props): {
  gateEmcallGrps: IfTbGateEmcallGrp[];
  setGateEmcallGrps: (v: IfTbGateEmcallGrp[]) => void;
  saveEmcallGrps: (p: { gateSeq: number }) => Promise<void>;
} => {
  const { data: list } = useSWR<IfTbGateEmcallGrp[]>(
    !!gateSeq && [`/api/gate_emcall_grp/list`, { gateSeq }]
  );
  const [gateEmcallGrps, setGateEmcallGrps] = useState<IfTbGateEmcallGrp[]>([]);
  useEffect(() => {
    setGateEmcallGrps((list || []).map((ele) => ({ ...ele })));
  }, [list]);

  const isEmcallsEqual = useCallback((): boolean => {
    const s1 = new Set((list || []).map((ele) => ele.emcall_grp_seq!));
    const s2 = new Set(gateEmcallGrps.map((ele) => ele.emcall_grp_seq!));
    return eqSet(s1, s2);
  }, [list, gateEmcallGrps]);

  const saveEmcallGrps = useCallback(
    ({ gateSeq }: { gateSeq: number }) => {
      return new Promise<void>((resolve, reject) => {
        if (isEmcallsEqual()) {
          resolve();
          return;
        }
        const list = gateEmcallGrps.map((ele) => ({ ...ele, gate_seq: gateSeq }));
        axios
          .post('/api/gate_emcall_grp/saves', { gateSeq, list })
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
    [isEmcallsEqual, gateEmcallGrps]
  );

  return {
    gateEmcallGrps,
    setGateEmcallGrps,
    saveEmcallGrps,
  };
};
