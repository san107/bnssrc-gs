import { IfEbrdMsgInfo } from '@/models/ebrd/tb_ebrd_msg';
import { useEffect, useState } from 'react';
import useSWR from 'swr';

export interface IfChkEbrdMsgInfo extends IfEbrdMsgInfo {
  chk: boolean;
}
export const useApiEbrdEmerMsgs = (
  ebrd_seq: number | undefined,
  isEmer: boolean | undefined
): { list: IfChkEbrdMsgInfo[]; setList: (list: IfChkEbrdMsgInfo[]) => void } => {
  const { data } = useSWR<IfEbrdMsgInfo[]>(
    !!ebrd_seq && isEmer && [`/api/ebrd_msg/list?ebrd_seq=${ebrd_seq}`]
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
