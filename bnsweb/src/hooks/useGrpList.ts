import { IfTbGrp } from '@/models/tb_grp';
import useSWR from 'swr';
import { useLoginInfo } from '@/app/(admin)/leftmenu/useLoginInfo';

export const useGrpList = () => {
  const { login } = useLoginInfo();
  const { data, mutate, isLoading } = useSWR<IfTbGrp[]>(
    login?.grp_id ? [`/api/grp/childlist?grpId=${login?.grp_id}`] : undefined
  );
  return { data, mutate, isLoading };
};
