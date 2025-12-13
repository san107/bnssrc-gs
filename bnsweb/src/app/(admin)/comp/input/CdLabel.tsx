'use client';
// @flow
import { IfTbCd } from '@/models/comm/tb_cd';
import useSWR from 'swr';
type Props = {
  cd: string | undefined;
};
export const CdLabel = ({ cd }: Props) => {
  const { data, isLoading } = useSWR<IfTbCd>(cd && ['/api/cd/one', { cd }]);
  if (isLoading) return null;
  return <>{data?.cd_nm}</>;
};
