import React from 'react';
import { Box, Button } from '@mui/material';
import { IfTbWater } from '@/models/water/tb_water';
import { IfTbGate } from '@/models/gate/tb_gate';
import { GateTable } from '@/app/(admin)/dashbd/dark/table/GateTable';
import BoxStatGate from '@/app/(admin)/dashbd/dark/box/BoxStatGate';
import useColor from '@/hooks/useColor';

type Props = {
  selWater?: IfTbWater;
  gates: IfTbGate[] | undefined;
  openMainCam: boolean;
  openSubCam: boolean;
  viewMainCam: (open: boolean) => void;
  viewSubCam: (open: boolean, data?: IfTbGate) => void;
  exNotiCount: (title: string, list: string[]) => void;
  isMobile: boolean;
};

export const GateList = ({
  selWater,
  gates,
  openMainCam,
  openSubCam,
  viewMainCam,
  viewSubCam,
  exNotiCount,
  isMobile,
}: Props) => {
  const boxHeight = 326; // 차단장비 상태, 연관 차단장비
  const { button } = useColor();

  // 수위계가 있는지 여부에 따라 제목 변경
  const title = selWater ? '수위계 연관 차단장비' : '전체 차단장비';
  const subtitle = selWater ? '차단장비 목록' : '차단장비 목록';

  return (
    <div className='col-xl-4'>
      <div className='card card-chart'>
        <div className='card-header'>
          <div className='row'>
            <div className='col-sm-4 text-left'>
              <h5 className='card-category'>{title}</h5>
              <h3 className='card-title'>{subtitle}</h3>
            </div>
            <div className='col-sm-8'>
              <BoxStatGate gates={gates || []} callback={exNotiCount} />
            </div>
          </div>
          {!isMobile && (
            <>
              <span className='absolute left-4 top-20'>
                <Button
                  className={
                    openMainCam ? `btn btn-sm ${button} btn-simple` : `btn btn-sm ${button}`
                  }
                  onClick={() => viewMainCam(!openMainCam)}
                >
                  {openMainCam ? '주카메라 닫기' : '주카메라 보기'}
                </Button>
              </span>
              {(openMainCam || openSubCam) && (
                <span className='absolute left-40 top-20'>
                  <Button
                    className={`btn btn-sm ${button} btn-simple`}
                    onClick={() => {
                      viewMainCam(false);
                      viewSubCam(false);
                    }}
                  >
                    카메라 닫기
                  </Button>
                </span>
              )}
            </>
          )}
        </div>
        <div className='card-body'>
          <Box sx={{ minHeight: boxHeight, maxHeight: boxHeight, overflow: 'auto' }}>
            <GateTable
              selWater={selWater}
              mainOpen={openMainCam}
              subOpen={openSubCam}
              setSubOpen={viewSubCam}
            />
          </Box>
        </div>
      </div>
    </div>
  );
};
