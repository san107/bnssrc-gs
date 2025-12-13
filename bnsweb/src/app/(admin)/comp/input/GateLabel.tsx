'use client';
import { IfTbGate } from '@/models/gate/tb_gate';
import useSWR from 'swr';
import { formStyles } from '@/app/(admin)/settings/comp/commStyles';
type Props = {
  gateSeq: number | undefined | null;
  label?: string;
  style?: boolean;
};
export const GateLabel = ({ gateSeq, label, style = true }: Props) => {
  const { data, isLoading } = useSWR<IfTbGate>(!!gateSeq && ['/api/gate/one', { gateSeq }]);
  if (isLoading) return null;
  return (
    <>
      <span style={style ? formStyles.comboLabel : {}}>
        {style ? <em>{data?.gate_nm ?? label}</em> : data?.gate_nm ?? label}
      </span>
    </>
  );
};
