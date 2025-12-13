'use client';
import { formStyles } from '@/app/(admin)/settings/comp/commStyles';
import { IfTbWater } from '@/models/water/tb_water';
import useSWR from 'swr';
type Props = {
  waterSeq: number | undefined;
  label?: string;
  style?: boolean;
};
export const WaterLabel = ({ waterSeq, label, style }: Props) => {
  const { data, isLoading } = useSWR<IfTbWater>(!!waterSeq && ['/api/water/one', { waterSeq }]);
  if (isLoading) return null;
  return (
    <>
      <span style={style ? formStyles.comboLabel : {}}>
        {style ? <em>{data?.water_nm ?? label}</em> : data?.water_nm ?? label}
      </span>
    </>
  );
};
