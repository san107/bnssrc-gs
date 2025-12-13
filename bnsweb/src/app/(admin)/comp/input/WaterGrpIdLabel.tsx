'use client';
import { formStyles } from '@/app/(admin)/settings/comp/commStyles';
import { IfTbWater } from '@/models/water/tb_water';
import { useMemo } from 'react';
import useSWR from 'swr';
type Props = {
  waterSeq: number | undefined;
  label?: string;
  style?: boolean;
};
export const WaterGrpIdLabel = ({ waterSeq, label, style }: Props) => {
  const { data, isLoading } = useSWR<IfTbWater[]>(
    !!waterSeq && ['/api/water_grp/list_water', { water_seq: waterSeq }]
  );

  const waterGrpId = useMemo(() => {
    if (!waterSeq) return null;
    if (!data?.[0]?.water_seq) return null;
    return [waterSeq, data?.[0]?.water_seq]
      .sort((a, b) => a - b)
      .map((d) => d.toString().padStart(1, '0'))
      .join('-');
  }, [waterSeq, data]);

  if (isLoading) return null;
  if (!waterSeq) return null;

  return (
    <>
      <span style={style ? formStyles.comboLabel : {}}>
        {style ? <em>{waterGrpId ?? label}</em> : waterGrpId ?? label}
      </span>
    </>
  );
};
