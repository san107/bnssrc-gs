'use client';
import { formStyles } from '@/app/(admin)/settings/comp/commStyles';
import { IfTbWater } from '@/models/water/tb_water';
import useSWR from 'swr';
type Props = {
  waterSeq: number | undefined;
  label?: string;
  style?: boolean;
};
export const WaterLabelLinked = ({ waterSeq: water_seq, label, style }: Props) => {
  const { data, isLoading } = useSWR<IfTbWater[]>(
    !!water_seq && ['/api/water_grp/list_water', { water_seq }]
  );
  if (isLoading) return null;
  return (
    <>
      <span style={style ? formStyles.comboLabel : {}}>
        {style ? (
          <em>{data?.map((d) => d.water_nm).join(',') ?? label}</em>
        ) : (
          data?.map((d) => d.water_nm).join(',') ?? label
        )}
      </span>
    </>
  );
};
