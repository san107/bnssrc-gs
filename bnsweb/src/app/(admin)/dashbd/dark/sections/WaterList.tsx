import React, { useState } from 'react';
import { IfTbWater } from '@/models/water/tb_water';
import { WaterTable } from '@/app/(admin)/dashbd/dark/table/WaterTable';
import ChartWaterPie from '@/app/(admin)/dashbd/dark/chart/ChartWaterPie';
import BoxStatWater from '@/app/(admin)/dashbd/dark/box/BoxStatWater';
import useColor from '@/hooks/useColor';
import { Dispatch, SetStateAction } from 'react';
import { Box } from '@mui/material';

type Props = {
  waters: IfTbWater[] | undefined;
  selWater: IfTbWater;
  setSelWater: Dispatch<SetStateAction<IfTbWater>>;
  exNotiCount: (title: string, list: string[]) => void;
  isMobile: boolean;
};

export const WaterList = ({ waters, selWater, setSelWater, exNotiCount, isMobile }: Props) => {
  const boxHeight = 326; // 수위계 목록
  const { button } = useColor();
  const [tabIndex, setTabIndex] = useState<number>(0);

  return (
    <div className='col-xl-4'>
      <div className='card card-chart'>
        <div className='card-header'>
          <div className='row'>
            <div className='col-sm-6 text-left'>
              <h5 className='card-category'>수위계 상태</h5>
              <h3 className='card-title'>수위계 목록</h3>
              <div className='btn-group btn-group-toggle' data-toggle='buttons'>
                <label
                  id='0'
                  className={
                    tabIndex === 0
                      ? `btn btn-sm ${button} btn-simple active`
                      : `btn btn-sm ${button} btn-simple`
                  }
                  onClick={() => setTabIndex(0)}
                >
                  <input type='radio' className='d-none d-sm-none' name='options' />
                  <span className='d-none d-sm-block d-md-block d-lg-block d-xl-block'>테이블</span>
                  <span className='d-block d-sm-none'></span>
                </label>
                <label
                  id='1'
                  className={
                    tabIndex === 1
                      ? `btn btn-sm ${button} btn-simple active`
                      : `btn btn-sm ${button} btn-simple`
                  }
                  onClick={() => setTabIndex(1)}
                >
                  <input type='radio' className='d-none d-sm-none' name='options' />
                  <span className='d-none d-sm-block d-md-block d-lg-block d-xl-block'>차트</span>
                  <span className='d-block d-sm-none'></span>
                </label>
              </div>
            </div>
            <div className='col-sm-6'>
              <BoxStatWater waters={waters || []} callback={exNotiCount} />
            </div>
          </div>
        </div>
        <div className='card-body'>
          <Box sx={{ minHeight: boxHeight }}>
            {tabIndex === 0 ? (
              <WaterTable
                waters={waters}
                selWater={selWater}
                setSelWater={setSelWater}
                mainOpen={isMobile}
                subOpen={isMobile}
              />
            ) : (
              <ChartWaterPie waters={waters} />
            )}
          </Box>
        </div>
      </div>
    </div>
  );
};
