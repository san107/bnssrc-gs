// @flow
import { IfTbGateEbrd } from '@/models/gate/tb_gate_ebrd';
import { eqSet } from '@/utils/math-utils';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import useSWR from 'swr';

type Props = {
  gateSeq: number | undefined;
};
export const useApiGateEbrd = ({
  gateSeq,
}: Props): {
  gateEbrds: IfTbGateEbrd[];
  setGateEbrds: (v: IfTbGateEbrd[]) => void;
  saveEbrds: (p: { gateSeq: number }) => Promise<void>;
} => {
  const { data: list } = useSWR<IfTbGateEbrd[]>(!!gateSeq && [`/api/gate_ebrd/list`, { gateSeq }]);
  const [gateEbrds, setGateEbrds] = useState<IfTbGateEbrd[]>([]);
  useEffect(() => {
    setGateEbrds((list || []).map((ele) => ({ ...ele })));
  }, [list]);

  const isEbrdsEqual = useCallback((): boolean => {
    const s1 = new Set((list || []).map((ele) => ele.ebrd_seq!));
    const s2 = new Set(gateEbrds.map((ele) => ele.ebrd_seq!));
    return eqSet(s1, s2);
  }, [list, gateEbrds]);

  const saveEbrds = useCallback(
    ({ gateSeq }: { gateSeq: number }) => {
      return new Promise<void>((resolve, reject) => {
        if (isEbrdsEqual()) {
          resolve();
          return;
        }
        const list = gateEbrds.map((ele) => ({ ...ele, gate_seq: gateSeq }));
        axios
          .post('/api/gate_ebrd/saves', { gateSeq, list })
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
    [isEbrdsEqual, gateEbrds]
  );

  return {
    gateEbrds,
    setGateEbrds,
    saveEbrds,
  };
};
