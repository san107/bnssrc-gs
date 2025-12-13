import { IfTbEbrd } from '@/models/ebrd/tb_ebrd';
import React, { useEffect, useState } from 'react';

type Props = {
  ebrds: IfTbEbrd[];
  callback: (title: string, list: string[]) => void;
};

const BoxStatEbrd = ({ ebrds, callback }: Props) => {
  const [ebrdErrCount, setEbrdErrCount] = useState<number>(0);

  useEffect(() => {
    // 장애 카운트 (전광판)
    const ebrdErrCnt = (ebrds || []).filter(
      (ele) => !ele.comm_stat || ele.comm_stat === 'Err'
    ).length;

    setEbrdErrCount(ebrdErrCnt);
  }, [ebrds]);

  const handleClickCount = (count: number) => {
    if (count === 0) return;
    const title = '전광판 장애';
    const list = (ebrds || [])
      .filter((ele) => !ele.comm_stat || ele.comm_stat === 'Err')
      .map((ele) => ele.ebrd_nm || '');
    callback(title, list);
  };

  return (
    <div>
      <div className='muti-label'>
        <p className='card-category2'>장애</p>
        <h3 className='card-count' onClick={() => handleClickCount(ebrdErrCount)}>
          <span className={ebrdErrCount > 0 ? 'c-err' : 'c-norm'}>{ebrdErrCount}</span>
          <span className='c-norm'>/{ebrds?.length}</span>
        </h3>
      </div>
    </div>
  );
};

export default BoxStatEbrd;
