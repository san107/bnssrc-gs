import { IfTbWater } from '@/models/water/tb_water';
import React, { useEffect, useState } from 'react';

type Props = {
  waters: IfTbWater[];
  callback: (title: string, list: string[]) => void;
};

const BoxStatWater = ({ waters, callback }: Props) => {
  const [waterErrCount, setWaterErrCount] = useState<number>(0);
  const [waterAlertCount, setWaterAlertCount] = useState<number>(0);
  const [waterCritCount, setWaterCritCount] = useState<number>(0);

  useEffect(() => {
    // 장애 카운트 (수위계)
    const waterErrCnt = (waters || [])?.filter(
      (ele) => !ele.comm_stat || ele.comm_stat === 'Err'
    ).length;
    // 경계 카운트 (수위계)
    const waterAlertCnt = (waters || [])?.filter(
      (ele) => !ele.water_stat || ele.water_stat === 'Alert'
    ).length;
    // 심각 카운트 (수위계)
    const waterCritCnt = (waters || [])?.filter(
      (ele) => !ele.water_stat || ele.water_stat === 'Crit'
    ).length;

    setWaterErrCount(waterErrCnt);
    setWaterAlertCount(waterAlertCnt);
    setWaterCritCount(waterCritCnt);
  }, [waters]);

  const handleClickCount = (count: number, stat?: string) => {
    if (count === 0) return;
    let title: string = '';
    let list: string[] = [];

    if (stat === 'Alert') {
      title = '수위계 경계상태';
      list = (waters || [])
        .filter((ele) => !ele?.water_stat || ele?.water_stat === 'Alert')
        .map((ele) => ele?.water_nm || '');
    } else if (stat === 'Crit') {
      title = '수위계 심각상태';
      list = (waters || [])
        .filter((ele) => !ele?.water_stat || ele?.water_stat === 'Crit')
        .map((ele) => ele?.water_nm || '');
    } else {
      title = '수위계 장애';
      list = (waters || [])
        .filter((ele) => !ele?.comm_stat || ele?.comm_stat === 'Err')
        .map((ele) => ele?.water_nm || '');
    }
    callback(title, list);
  };

  return (
    <div>
      <div className='muti-label'>
        <p className='card-category2'>심각</p>
        <h3 className='card-count' onClick={() => handleClickCount(waterCritCount, 'Crit')}>
          <span className={waterCritCount > 0 ? 'c-crit' : 'c-norm'}>{waterCritCount}</span>
          <span className='c-norm'>/{waters?.length}</span>
        </h3>
      </div>
      <div className='muti-label'>
        <p className='card-category2'>경계</p>
        <h3 className='card-count' onClick={() => handleClickCount(waterAlertCount, 'Alert')}>
          <span className={waterAlertCount > 0 ? 'c-alert' : 'c-norm'}>{waterAlertCount}</span>
          <span className='c-norm'>/{waters?.length}</span>
        </h3>
      </div>
      <div className='muti-label'>
        <p className='card-category2'>장애</p>
        <h3 className='card-count' onClick={() => handleClickCount(waterErrCount)}>
          <span className={waterErrCount > 0 ? 'c-err' : 'c-norm'}>{waterErrCount}</span>
          <span className='c-norm'>/{waters?.length}</span>
        </h3>
      </div>
    </div>
  );
};

export default BoxStatWater;
