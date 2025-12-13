import { IfTbCd } from '@/models/comm/tb_cd';
import useSWR from 'swr';

export const useApiCd = (param: { cd?: string; grp?: string; id?: string }): IfTbCd | undefined => {
  const { data: cd } = useSWR<IfTbCd | undefined>(
    (param.cd || (param.grp && param.id)) && ['/api/cd/one', param]
  );
  return cd;
};
