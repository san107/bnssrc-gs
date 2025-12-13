'use client';
import { IfTbEmcall } from '@/models/emcall/tb_emcall';
import useSWR from 'swr';
import { formStyles } from '@/app/(admin)/settings/comp/commStyles';
type Props = {
  emcallSeq: number | undefined | null;
  label?: string;
};
export const EmcallLabel = ({ emcallSeq, label }: Props) => {
  const { data, isLoading } = useSWR<IfTbEmcall>(!!emcallSeq && ['/api/emcall/one', { emcallSeq }]);
  if (isLoading) return null;
  // return <>{data?.emcall_nm ?? label}</>;
  return (
    <>
      <span style={formStyles.comboLabel}>
        <em>{data?.emcall_nm ?? label}</em>
      </span>
    </>
  );
};
