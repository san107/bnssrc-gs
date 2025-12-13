import { IfTbCamera } from '@/models/tb_camera';
import React, { useEffect, useState } from 'react';

type Props = {
  cameras: IfTbCamera[];
  callback: (title: string, list: string[]) => void;
};

const BoxStatCamera = ({ cameras, callback }: Props) => {
  const [camErrCount, setCamErrCount] = useState<number>(0);

  useEffect(() => {
    // 장애 카운트 (카메라)
    const camErrCnt = (cameras || []).filter(
      (ele) => !ele.cam_stat || ele.cam_stat === 'Err'
    ).length;

    setCamErrCount(camErrCnt);
  }, [cameras]);

  const handleClickCount = (count: number) => {
    if (count === 0) return;
    const title = '카메라 장애';
    const list = (cameras || [])
      .filter((ele) => !ele.cam_stat || ele.cam_stat === 'Err')
      .map((ele) => ele.cam_nm || '');
    callback(title, list);
  };

  return (
    <div>
      <div className='muti-label'>
        <p className='card-category2'>장애</p>
        <h3 className='card-count' onClick={() => handleClickCount(camErrCount)}>
          <span className={camErrCount > 0 ? 'c-err' : 'c-norm'}>{camErrCount}</span>
          <span className='c-norm'>/{cameras?.length}</span>
        </h3>
      </div>
    </div>
  );
};

export default BoxStatCamera;
