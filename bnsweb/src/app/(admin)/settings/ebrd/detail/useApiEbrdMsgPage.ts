import { IfEbrdMsgInfo } from '@/models/ebrd/tb_ebrd_msg';
import { useEffect, useState } from 'react';
import useSWR from 'swr';

export interface IfChkEbrdMsgInfo extends IfEbrdMsgInfo {
  chk: boolean;
}
export const useApiEbrdMsgPage = (
  ebrd_seq: number | undefined
): {
  list: IfChkEbrdMsgInfo[];
  page: number;
  hasMore: boolean;
  next: () => void;
  prev: () => void;
} => {
  const [page, setPage] = useState(1);
  const { data } = useSWR<IfEbrdMsgInfo[]>(
    !!ebrd_seq && [`/api/ebrd_msg/page?ebrd_seq=${ebrd_seq}&page=${page}`]
  );
  const [list, setList] = useState<IfChkEbrdMsgInfo[]>([]);

  useEffect(() => {
    setList([]);
    setPage(1);
  }, [ebrd_seq]);

  useEffect(() => {
    if (data) {
      ///setList([...list, ...data.map((ele) => ({ ...ele, chk: false }))]);
      setList(data.map((ele) => ({ ...ele, chk: false })));
    } else {
      setList([]);
    }
  }, [data]);

  const next = () => {
    if (!ebrd_seq) return;
    if (!hasMore) return;
    setPage(page + 1);
  };

  const prev = () => {
    if (!ebrd_seq) return;
    if (page === 1) return;
    setPage(page - 1);
  };

  const hasMore =
    (data?.length || 0) > 0 && (data?.length || 0) % 10 === 0 && data?.length === 10 * page;
  //console.log('hasMore', hasMore, data?.length, page);
  return { list, next, prev, page, hasMore };
};
