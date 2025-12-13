import { IfEbrdMsgInfo } from '@/models/ebrd/tb_ebrd_msg';
import { useEffect, useState } from 'react';
import useSWR from 'swr';

export interface IfChkEbrdMsgInfo extends IfEbrdMsgInfo {
  chk: boolean;
}
export const useApiEbrdMsgInfo = (
  ebrd_seq: number | undefined,
  running: boolean | undefined
): { list: IfChkEbrdMsgInfo[]; setList: (list: IfChkEbrdMsgInfo[]) => void } => {
  const { data } = useSWR<IfEbrdMsgInfo[]>(
    !!ebrd_seq && [`/api/ebrd_msg/list?ebrd_seq=${ebrd_seq}&running=${running ? 1 : 0}`]
  );
  const [list, setList] = useState<IfChkEbrdMsgInfo[]>([]);

  useEffect(() => {
    if (data) {
      setList(data.map((ele) => ({ ...ele, chk: false })));
    } else {
      setList([]);
    }
  }, [data]);

  return { list, setList };
};
