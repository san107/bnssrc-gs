import React from 'react';
import { Box } from '@mui/material';
import { EmcallTable } from '@/app/(admin)/dashbd/dark/table/EmcallTable';
import BoxStatEmcall from '@/app/(admin)/dashbd/dark/box/BoxStatEmcall';
import { IfTbEmcall } from '@/models/emcall/tb_emcall';

type Props = {
  emcalls: IfTbEmcall[] | undefined;
  exNotiCount: (title: string, list: string[]) => void;
};

export const EmcallList = ({ emcalls, exNotiCount }: Props) => {
  const boxHeight = 326; // 비상통화장치 목록

  return (
    <div className='col-xl-4'>
      <div className='card card-chart'>
        <div className='card-header'>
          <div className='row'>
            <div className='col-sm-4 text-left'>
              <h5 className='card-category'>비상통화장치 상태</h5>
              <h3 className='card-title'>비상통화장치 목록</h3>
            </div>
            <div className='col-sm-8'>
              <BoxStatEmcall emcalls={emcalls || []} callback={exNotiCount} />
            </div>
          </div>
        </div>
        <div className='card-body'>
          <Box sx={{ minHeight: boxHeight, overflow: 'auto' }}>
            <EmcallTable emcalls={emcalls} />
          </Box>
        </div>
      </div>
    </div>
  );
};
