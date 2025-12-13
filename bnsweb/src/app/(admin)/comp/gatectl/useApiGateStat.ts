import { swrPostFetcher } from '@/utils/swr-provider';
import useSWR from 'swr';

export const useApiGateStat = <T>(gateSeq: number | undefined) => {
  const { data: stat } = useSWR<T>(
    !!gateSeq && ['/api/gate/control', { gate_seq: gateSeq, gate_cmd: 'Stat' }],
    swrPostFetcher,
    { refreshInterval: 3000 }
  );

  return { stat };
};
