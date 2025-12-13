import React from 'react';
import { Box } from '@mui/material';
import { CameraTable } from '@/app/(admin)/dashbd/dark/table/CameraTable';
import BoxStatCamera from '@/app/(admin)/dashbd/dark/box/BoxStatCamera';
import { IfTbCamera } from '@/models/tb_camera';

type Props = {
  cameras: IfTbCamera[] | undefined;
  exNotiCount: (title: string, list: string[]) => void;
  isMobile: boolean;
};

export const CameraList = ({ cameras, exNotiCount, isMobile }: Props) => {
  const boxHeight = 326; // 카메라 목록

  return (
    <div className='col-xl-4'>
      <div className='card card-chart'>
        <div className='card-header'>
          <div className='row'>
            <div className='col-sm-4 text-left'>
              <h5 className='card-category'>카메라 상태</h5>
              <h3 className='card-title'>카메라 목록</h3>
            </div>
            <div className='col-sm-8'>
              <BoxStatCamera cameras={cameras || []} callback={exNotiCount} />
            </div>
          </div>
        </div>
        <div className='card-body'>
          <Box sx={{ minHeight: boxHeight, maxHeight: boxHeight, overflow: 'auto' }}>
            <CameraTable cameras={cameras} isMobile={isMobile} />
          </Box>
        </div>
      </div>
    </div>
  );
};
