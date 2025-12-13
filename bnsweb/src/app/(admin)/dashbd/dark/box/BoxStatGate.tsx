import { IfTbGate } from '@/models/gate/tb_gate';
import React, { useEffect, useState } from 'react';

type Props = {
  gates: IfTbGate[];
  callback: (title: string, list: string[]) => void;
};

const BoxStatGate = ({ gates, callback }: Props) => {
  const [gateErrCount, setGateErrCount] = useState<number>(0);
  const [gateUpCount, setGateUpCount] = useState<number>(0);
  const [gateDownCount, setGateDownCount] = useState<number>(0);

  useEffect(() => {
    // 장애 카운트 (차단장비)
    const gateErrCnt = (gates || [])?.filter(
      (ele) => !ele.gate_stat || ele.gate_stat === 'Na'
    ).length;
    // 열림 카운트 (차단장비)
    const gateUpCnt = (gates || [])?.filter(
      (ele) => ele.gate_stat === 'UpOk' || ele.gate_stat === 'UpLock'
    ).length;
    // 닫힘 카운트 (차단장비)
    const gateDownCnt = (gates || [])?.filter((ele) => ele.gate_stat === 'DownOk').length;

    setGateErrCount(gateErrCnt);
    setGateUpCount(gateUpCnt);
    setGateDownCount(gateDownCnt);
  }, [gates]);

  const handleClickCount = (count: number, stat?: string) => {
    if (count === 0) return;
    let title: string = '';
    let list: string[] = [];

    if (stat === 'Up') {
      title = '차단장비 열림상태';
      list = (gates || [])
        .filter((ele) => ele?.gate_stat === 'UpOk' || ele?.gate_stat === 'UpLock')
        .map((ele) => ele?.gate_nm || '');
    } else if (stat === 'Down') {
      title = '차단장비 닫힘상태';
      list = (gates || [])
        .filter((ele) => ele?.gate_stat === 'DownOk')
        .map((ele) => ele?.gate_nm || '');
    } else {
      title = '차단장비 장애';
      list = (gates || [])
        .filter((ele) => !ele?.gate_stat || ele?.gate_stat === 'Na')
        .map((ele) => ele?.gate_nm || '');
    }
    callback(title, list);
  };

  return (
    <div>
      <div className='muti-label'>
        <p className='card-category2'>닫힘</p>
        <h3 className='card-count' onClick={() => handleClickCount(gateDownCount, 'Down')}>
          <span className={gateDownCount > 0 ? 'c-down' : 'c-norm'}>{gateDownCount}</span>
          <span className='c-norm'>/{gates?.length}</span>
        </h3>
      </div>
      <div className='muti-label'>
        <p className='card-category2'>열림</p>
        <h3 className='card-count' onClick={() => handleClickCount(gateUpCount, 'Up')}>
          <span className={gateUpCount > 0 ? 'c-up' : 'c-norm'}>{gateUpCount}</span>
          <span className='c-norm'>/{gates?.length}</span>
        </h3>
      </div>
      <div className='muti-label'>
        <p className='card-category2'>장애</p>
        <h3 className='card-count' onClick={() => handleClickCount(gateErrCount)}>
          <span className={gateErrCount > 0 ? 'c-err' : 'c-norm'}>{gateErrCount}</span>
          <span className='c-norm'>/{gates?.length}</span>
        </h3>
      </div>
    </div>
  );
};

export default BoxStatGate;
