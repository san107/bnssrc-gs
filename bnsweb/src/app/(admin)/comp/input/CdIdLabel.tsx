'use client';
// @flow
import { StatLabel } from '@/app/(admin)/comp/input/StatLabel';
import { IfTbCd } from '@/models/comm/tb_cd';
import useSWR from 'swr';
type Props = {
  grp: string | undefined;
  id: string | undefined;
  isStat?: boolean;
};
export const CdIdLabel = ({ grp, id, isStat }: Props) => {
  const { data, isLoading } = useSWR<IfTbCd>(grp && id && ['/api/cd/one', { grp, id }]);

  const label = data?.cd_nm === undefined ? 'N/A' : data?.cd_nm;
  if (isLoading) return null;
  return <>{isStat ? <StatLabel stat={data?.cd_id} label={label} /> : <>{label}</>}</>;
};
