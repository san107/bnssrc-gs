'use client';
import { IfTbGrp } from '@/models/tb_grp';
import useSWR from 'swr';
type Props = {
  grpId: string | undefined;
};
export const GrpLabel = ({ grpId }: Props) => {
  const { data, isLoading } = useSWR<IfTbGrp>(!!grpId && ['/api/grp/one', { grpId }]);
  if (isLoading) return null;
  return <>{data?.grp_nm ?? grpId}</>;
};
