import React from 'react';
import { Box } from '@mui/material';
import { EbrdTable } from '@/app/(admin)/dashbd/dark/table/EbrdTable';
import BoxStatEbrd from '@/app/(admin)/dashbd/dark/box/BoxStatEbrd';
import { IfTbEbrd } from '@/models/ebrd/tb_ebrd';

type Props = {
  ebrds: IfTbEbrd[] | undefined;
  exNotiCount: (title: string, list: string[]) => void;
};

export const EbrdList = ({ ebrds, exNotiCount }: Props) => {
  const boxHeight = 326; // 전광판 목록

  return (
    <div className='col-xl-4'>
      <div className='card card-chart'>
        <div className='card-header'>
          <div className='row'>
            <div className='col-sm-4 text-left'>
              <h5 className='card-category'>전광판 상태</h5>
              <h3 className='card-title'>전광판 목록</h3>
            </div>
            <div className='col-sm-8'>
              <BoxStatEbrd ebrds={ebrds || []} callback={exNotiCount} />
            </div>
          </div>
        </div>
        <div className='card-body'>
          <Box sx={{ minHeight: boxHeight, overflow: 'auto' }}>
            <EbrdTable ebrds={ebrds} />
          </Box>
        </div>
      </div>
    </div>
  );
};
