// @flow

import { WaterGraph } from '@/app/(admin)/dashbd/light/WaterGraph';
import { WaterLevel } from '@/app/(admin)/dashbd/light/WaterLevel';
import { LevelSlider } from '@/app/icons/LevelSlider';
import { IfTbWater } from '@/models/water/tb_water';
import { Box, MenuItem, Select, SvgIcon, Typography } from '@mui/material';
import clsx from 'clsx';
import { useState } from 'react';
import { PiNetwork, PiNetworkSlash } from 'react-icons/pi';
import * as waterutils from '@/utils/water-utils';

type Props = {
  selWater: IfTbWater;
};
export const DashboardBody = ({ selWater }: Props) => {
  const [hours, setHours] = useState(5);
  return (
    <>
      <Box className='water-graph-header'>
        <Box
          flexGrow={1}
          sx={{
            textAlign: 'center',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <SvgIcon>
            <LevelSlider color={waterutils.waterLevelColor(selWater.water_stat)} />
          </SvgIcon>
          &nbsp; <span className='hue'>{selWater.water_nm}</span>
        </Box>
        <Box sx={{ position: 'relative', right: 0, top: 0 }}>
          <Typography display={'inline'}>그래프 표시 </Typography>
          <Select
            sx={{ width: 110, backgroundColor: '#fff' }}
            value={hours}
            onChange={(e) =>
              setHours(
                typeof e.target.value === 'number' ? e.target.value : parseInt(e.target.value)
              )
            }
            fullWidth
          >
            {[1, 2, 3, 5, 8, 12, 24]
              .map((ele) => ({ k: ele, v: ele + ' 시간' }))
              .map((ele) => (
                <MenuItem key={ele.v} value={ele.k}>
                  {ele.v}
                </MenuItem>
              ))}
          </Select>
        </Box>
      </Box>
      <Box display={'flex'}>
        <Box flexGrow={1}>
          <WaterGraph water={selWater} hours={hours} />
        </Box>
        <Box width={'250px'} sx={{ display: 'flex', flexDirection: 'column' }}>
          <Box
            className={'pt-3'}
            sx={{ display: 'flex', padding: '5px', alignItems: 'center', justifyContent: 'center' }}
          >
            <Box
              className={clsx(selWater.comm_stat === 'Ok' ? 'bg-green-500' : 'bg-red-500')}
              sx={{
                color: 'white',
                padding: '10px',
                borderRadius: '20px',
                minWidth: '200px',
                textAlign: 'center',
              }}
            >
              <SvgIcon>{selWater.comm_stat === 'Ok' ? <PiNetwork /> : <PiNetworkSlash />}</SvgIcon>
              &nbsp;{selWater.comm_stat === 'Ok' ? '정상' : '장애'}
            </Box>
          </Box>
          <WaterLevel water={selWater} />
        </Box>
      </Box>
    </>
  );
};
