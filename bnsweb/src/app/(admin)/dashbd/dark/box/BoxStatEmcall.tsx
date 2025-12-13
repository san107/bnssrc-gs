import { IfTbEmcall } from '@/models/emcall/tb_emcall';
import React, { useEffect, useState } from 'react';

type Props = {
  emcalls: IfTbEmcall[];
  callback: (title: string, list: string[]) => void;
};

const BoxStatEmcall = ({ emcalls, callback }: Props) => {
  const [emcallErrCount, setEmcallErrCount] = useState<number>(0);

  useEffect(() => {
    // 장애 카운트 (비상통화장치)
    const emcallErrCnt = (emcalls || []).filter(
      (ele) => !ele.comm_stat || ele.comm_stat === 'Err'
    ).length;

    setEmcallErrCount(emcallErrCnt);
  }, [emcalls]);

  const handleClickCount = (count: number) => {
    if (count === 0) return;
    const title = '비상통화장치 장애';
    const list = (emcalls || [])
      .filter((ele) => !ele.comm_stat || ele.comm_stat === 'Err')
      .map((ele) => ele.emcall_nm || '');
    callback(title, list);
  };

  return (
    <div>
      <div className='muti-label'>
        <p className='card-category2'>장애</p>
        <h3 className='card-count' onClick={() => handleClickCount(emcallErrCount)}>
          <span className={emcallErrCount > 0 ? 'c-err' : 'c-norm'}>{emcallErrCount}</span>
          <span className='c-norm'>/{emcalls?.length}</span>
        </h3>
      </div>
    </div>
  );
};

export default BoxStatEmcall;
