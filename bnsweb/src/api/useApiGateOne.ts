import { IfTbGate } from '@/models/gate/tb_gate';
import useSWR from 'swr';

export const useApiGateOne = (
  gateSeq: number | undefined
): { gate: IfTbGate | undefined; mutateGate: () => Promise<IfTbGate | undefined> } => {
  const { data: gate, mutate: mutateGate } = useSWR<IfTbGate>(
    !!gateSeq && ['/api/gate/one', { gateSeq }]
  );
  return { gate, mutateGate };
};
