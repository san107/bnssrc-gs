import { IfTbCamera } from '@/models/tb_camera';
import { IfTbGate } from '@/models/gate/tb_gate';
import { IfTbWater } from '@/models/water/tb_water';
import useSWR from 'swr';
import { useLoginInfo } from '@/app/(admin)/leftmenu/useLoginInfo';
import { IfTbEbrd } from '@/models/ebrd/tb_ebrd';
import { IfTbEmcall } from '@/models/emcall/tb_emcall';
import { IfTbEmcallGrp } from '@/models/emcall/tb_emcall_grp';

export const useCameraList = (open?: boolean) => {
  const { login } = useLoginInfo();
  const { data, mutate } = useSWR<IfTbCamera[]>(
    (open ? login?.grp_id && open : login?.grp_id)
      ? [`/api/camera/childlist?grpId=${login?.grp_id}`]
      : undefined
  );
  return { data, mutate };
};

export const useGateList = (open?: boolean) => {
  const { login } = useLoginInfo();
  const { data, mutate } = useSWR<IfTbGate[]>(
    (open ? login?.grp_id && open : login?.grp_id)
      ? [`/api/gate/childlist?grpId=${login?.grp_id}`]
      : undefined
  );
  return { data, mutate };
};

export const useWaterList = () => {
  const { login } = useLoginInfo();
  const { data, mutate } = useSWR<IfTbWater[]>(
    login?.grp_id ? [`/api/water/childlist?grpId=${login?.grp_id}`] : undefined
  );
  return { data, mutate };
};

export const useWaterOne = (
  waterSeq: number
): { data: IfTbWater | undefined; mutate: () => void } => {
  const { data, mutate } = useSWR<IfTbWater>(
    waterSeq ? [`/api/water/one?waterSeq=${waterSeq}`] : undefined
  );
  return { data, mutate };
};

export const useEbrdList = () => {
  const { login } = useLoginInfo();
  const { data, mutate } = useSWR<IfTbEbrd[]>(login?.grp_id ? [`/api/ebrd/list`] : undefined);
  return { data, mutate };
};

export const useEmcallList = () => {
  const { login } = useLoginInfo();
  const { data, mutate } = useSWR<IfTbEmcall[]>(login?.grp_id ? [`/api/emcall/list`] : undefined);
  return { data, mutate };
};

export const useEmcallGrpList = () => {
  const { login } = useLoginInfo();
  const { data, mutate } = useSWR<IfTbEmcallGrp[]>(
    login?.grp_id ? [`/api/emcall_grp/list`] : undefined
  );
  return { data, mutate };
};
