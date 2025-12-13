// @flow

import { ChartWaterLine } from '@/app/(admin)/dashbd/dark/chart/ChartWaterLine';
import { ChartWaterStack } from '@/app/(admin)/dashbd/dark/chart/ChartWaterStack';
import { WaterLevel } from '@/app/(admin)/dashbd/dark/WaterLevel';
import { LevelSlider } from '@/app/icons/LevelSlider';
import { IfTbWater } from '@/models/water/tb_water';
import { Box, MenuItem, Select, SvgIcon } from '@mui/material';
import clsx from 'clsx';
import { useState } from 'react';
import { PiNetwork, PiNetworkSlash } from 'react-icons/pi';
import * as waterutils from '@/utils/water-utils';
import useColor from '@/hooks/useColor';

type Props = {
  selWater: IfTbWater;
  theme: 'light' | 'dark';
};

export const DashboardBody = ({ selWater, theme }: Props) => {
  const [hours, setHours] = useState<number>(5);
  const [chart, setChart] = useState<string>('Line');
  const { lineColor, selColor, hovColor } = useColor(); // color 설정

  return (
    <>
      <Box>
        <div className='row'>
          <div className='col-xl-6'>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'left',
                alignItems: 'center',
              }}
            >
              <SvgIcon>
                <LevelSlider color={waterutils.waterLevelColor(selWater.water_stat)} />
              </SvgIcon>
              &nbsp;&nbsp;
              <span style={{ fontSize: '1.2rem', color: theme === 'dark' ? '#aaa' : '#333' }}>
                {selWater.water_nm}
              </span>
            </Box>
          </div>
          <div className='col-xl-3'>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Select
                sx={{
                  width: 110,
                  height: 30,
                  marginTop: '8px',
                  color: '#fff',
                  backgroundColor: '#27293d',
                  border: `1px solid ${lineColor}`,
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'transparent',
                  },
                  '.MuiSvgIcon-root': {
                    color: '#fff',
                  },
                }}
                value={hours}
                onChange={(e) =>
                  setHours(
                    typeof e.target.value === 'number' ? e.target.value : parseInt(e.target.value)
                  )
                }
                fullWidth
                MenuProps={{
                  PaperProps: {
                    sx: {
                      '& .MuiList-root': {
                        color: '#fff',
                        backgroundColor: '#3c3e5c',
                      },
                      '& .MuiMenuItem-root.Mui-selected': {
                        backgroundColor: selColor,
                      },
                      '& .MuiMenuItem-root:hover': {
                        backgroundColor: hovColor,
                      },
                    },
                  },
                }}
              >
                {[1, 2, 3, 5, 8, 12, 24]
                  .map((ele) => ({ k: ele, v: ele + ' 시간' }))
                  .map((ele) => (
                    <MenuItem key={ele.v} value={ele.k}>
                      {ele.v}
                    </MenuItem>
                  ))}
              </Select>
              &nbsp;
              <Select
                sx={{
                  width: 110,
                  height: 30,
                  marginTop: '8px',
                  color: '#fff',
                  backgroundColor: '#27293d',
                  border: `1px solid ${lineColor}`,
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'transparent',
                  },
                  '.MuiSvgIcon-root': {
                    color: '#fff',
                  },
                }}
                value={chart}
                onChange={(e) => setChart(e.target.value)}
                fullWidth
                MenuProps={{
                  PaperProps: {
                    sx: {
                      '& .MuiList-root': {
                        color: '#fff',
                        backgroundColor: '#3c3e5c',
                      },
                      '& .MuiMenuItem-root.Mui-selected': {
                        backgroundColor: selColor,
                      },
                      '& .MuiMenuItem-root:hover': {
                        backgroundColor: hovColor,
                      },
                    },
                  },
                }}
              >
                {['Line', 'Stack']
                  .map((ele) => ({ k: ele, v: ele }))
                  .map((ele) => (
                    <MenuItem key={ele.v} value={ele.k}>
                      {ele.v}
                    </MenuItem>
                  ))}
              </Select>
            </Box>
          </div>
          <div className='col-xl-3'>
            <Box
              className={'pt-3'}
              sx={{
                display: 'flex',
                padding: '5px',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Box
                className={clsx(selWater.comm_stat === 'Ok' ? 'bg-green-700' : 'bg-red-500')}
                sx={{
                  color: 'white',
                  padding: '5px',
                  borderRadius: '20px',
                  minWidth: '200px',
                  textAlign: 'center',
                }}
              >
                <SvgIcon>
                  {selWater.comm_stat === 'Ok' ? <PiNetwork /> : <PiNetworkSlash />}
                </SvgIcon>
                &nbsp;{selWater.comm_stat === 'Ok' ? '정상' : '장애'}
              </Box>
            </Box>
          </div>
        </div>
      </Box>
      <div className='row'>
        <div className='col-xl-9'>
          {chart === 'Line' ? (
            <ChartWaterLine water={selWater} hours={hours} />
          ) : (
            <ChartWaterStack water={selWater} hours={hours} />
          )}
        </div>
        <div className='col-xl-3'>
          <Box
            className={'pt-3'}
            sx={{
              display: 'flex',
              padding: '5px',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <WaterLevel water={selWater} theme={theme} />
          </Box>
        </div>
      </div>
    </>
  );
};
