import { IfTbWaterGrp } from '@/models/water/tb_water_grp';
import axios from 'axios';
import { useEffect, useState } from 'react';
import useSWR from 'swr';

export const useApiLnkWater = (
  water_seq?: number
): {
  lnkWaterSeq: number | undefined;
  setLnkWaterSeq: (v: number | undefined) => void;
  saveLnkWater: (seq: number) => Promise<void>;
} => {
  const { data } = useSWR<IfTbWaterGrp[]>(!!water_seq && ['/api/water_grp/list', { water_seq }]);

  const [lnkWaterSeq, setLnkWaterSeq] = useState<number | undefined>(undefined);
  useEffect(() => {
    if (data) {
      setLnkWaterSeq(data[0]?.lnk_water_seq);
    } else {
      setLnkWaterSeq(undefined);
    }
  }, [data]);

  // 수정, 저장시, 항상 연결정보 업데이트 처리하도록.
  const saveLnkWater = (seq: number): Promise<void> => {
    if (!seq) return Promise.resolve();
    if (lnkWaterSeq) return axios.post('/api/water_grp/saves', [seq, lnkWaterSeq]);
    return axios.post('/api/water_grp/saves', [seq]); // 삭제처리함.
    // if (lnkWaterSeq === data?.[0]?.lnk_water_seq) return Promise.resolve();
    // const seqs = [water_seq];
    // if (lnkWaterSeq) seqs.push(lnkWaterSeq);
    // return axios.post('/api/water_grp/saves', seqs);
  };

  return { lnkWaterSeq, setLnkWaterSeq, saveLnkWater };
};
