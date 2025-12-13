// @flow
import { IfTbGateCamera } from '@/models/gate/tb_gate_camera';
import { eqSet } from '@/utils/math-utils';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import useSWR from 'swr';

type Props = {
  gateSeq: number | undefined;
};
export const useApiGateCamera = ({
  gateSeq,
}: Props): {
  gateCameras: IfTbGateCamera[];
  setGateCameras: (v: IfTbGateCamera[]) => void;
  saveCameras: (p: { gateSeq: number }) => Promise<void>;
} => {
  const { data: list } = useSWR<IfTbGateCamera[]>(
    !!gateSeq && [`/api/gate_camera/list`, { gateSeq }]
  );
  const [gateCameras, setGateCameras] = useState<IfTbGateCamera[]>([]);
  useEffect(() => {
    setGateCameras((list || []).map((ele) => ({ ...ele })));
  }, [list]);

  const isCamerasEqual = useCallback((): boolean => {
    const s1 = new Set((list || []).map((ele) => ele.cam_seq!));
    const s2 = new Set(gateCameras.map((ele) => ele.cam_seq!));
    return eqSet(s1, s2);
  }, [list, gateCameras]);

  const saveCameras = useCallback(
    ({ gateSeq }: { gateSeq: number }) => {
      return new Promise<void>((resolve, reject) => {
        if (isCamerasEqual()) {
          resolve();
          return;
        }
        const list = gateCameras.map((ele) => ({ ...ele, gate_seq: gateSeq }));
        axios
          .post('/api/gate_camera/saves', { gateSeq, list })
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
    [isCamerasEqual, gateCameras]
  );

  return {
    gateCameras,
    setGateCameras,
    saveCameras,
  };
};
