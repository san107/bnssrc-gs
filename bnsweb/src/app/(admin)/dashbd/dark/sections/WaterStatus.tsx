import { Box } from '@mui/material';
import { IfTbWater } from '@/models/water/tb_water';
import { DashboardBody } from '@/app/(admin)/dashbd/dark/DashboardBody';

type Props = {
  selWater: IfTbWater;
  theme: 'light' | 'dark';
};

export const WaterStatus = ({ selWater, theme }: Props) => {
  const boxHeight = 395; // 수위계 상태

  return (
    <div className='col-xl-8'>
      <div className='card card-chart'>
        <div className='card-header'>
          <div className='row'>
            <div className='col-sm-4 text-left'>
              <h5 className='card-category'>현재 수위계 상태</h5>
              <h2 className='card-title'>수위계</h2>
            </div>
          </div>
        </div>
        <div className='card-body' style={{ minHeight: boxHeight }}>
          <Box sx={{ width: '90%', margin: 'auto' }}>
            <DashboardBody selWater={selWater} theme={theme} />
          </Box>
        </div>
      </div>
    </div>
  );
};
