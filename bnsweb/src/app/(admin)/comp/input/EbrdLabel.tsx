'use client';
import useSWR from 'swr';
import { formStyles } from '@/app/(admin)/settings/comp/commStyles';
import { IfTbEbrd } from '@/models/ebrd/tb_ebrd';
type Props = {
  ebrdSeq: number | undefined | null;
  label?: string;
};
export const EbrdLabel = ({ ebrdSeq, label }: Props) => {
  const { data, isLoading } = useSWR<IfTbEbrd>(!!ebrdSeq && ['/api/ebrd/one', { ebrdSeq }]);
  if (isLoading) return null;
  return (
    <>
      <span style={formStyles.comboLabel}>
        <em>{data?.ebrd_nm ?? label}</em>
      </span>
    </>
  );
};
