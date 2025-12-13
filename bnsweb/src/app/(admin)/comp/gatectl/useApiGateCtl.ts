import { IfGateCmdReq } from '@/models/gate/tb_gate';
import { get_err_msg } from '@/utils/err-util';
import { swrMutatorData } from '@/utils/swr-provider';
import { toast } from 'sonner';
import useSWRMutation from 'swr/mutation';

export const useApiGateCtl = <T>() => {
  const { isMutating, trigger: api } = useSWRMutation('/api/gate/control', swrMutatorData);

  const trigger = (
    gateSeq: number,
    gateCmd: IfGateCmdReq['gate_cmd'],
    msg?: string
  ): Promise<T> => {
    return api({ gate_seq: gateSeq, gate_cmd: gateCmd, msg: msg })
      .then((res) => {
        if (res.cmd_res == 'Success') {
          toast.success('처리가 완료되었습니다.', { position: 'bottom-right' });
        } else if (res.cmd_res === 'ModeErr') {
          toast.error('모드 오류가 발생했습니다.', { position: 'bottom-right' });
        } else if (res.cmd_res == 'Fail') {
          toast.error('처리가 실패했습니다.', { position: 'bottom-right' });
        } else {
          toast.error('처리가 실패했습니다.(' + res.msg + ')', { position: 'bottom-right' });
        }
        return res;
      })
      .catch((err) => {
        toast.error('오류가 발생했습니다.(' + get_err_msg(err) + ')', { position: 'bottom-right' });
        throw err;
      });
  };

  return { isMutating, trigger };
};
