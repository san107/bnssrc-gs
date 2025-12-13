import React from 'react';
import { MapView } from '@/app/(admin)/comp/display/MapView';
import { IfTbWater } from '@/models/water/tb_water';
// import { IfWeather } from '@/models/weather';
import useAddress from '@/hooks/useAddress';

type Props = {
  selWater: IfTbWater;
  // pops: IfWeather[];
  theme: string;
};

export const WaterLocation = ({ selWater, theme }: Props) => {
  const boxHeight = 395; // 수위계 위치 (맵에 날씨를 표현하는 방식)
  const mapHeight = 365; // 맵
  const { fullAddress } = useAddress(selWater);

  return (
    <div className='col-xl-4'>
      <div className='card card-chart'>
        <div className='card-header'>
          <h5 className='card-category'>수위계 위치 정보</h5>
          <h3 className='card-title'>수위계 위치</h3>
        </div>
        <div className='card-body' style={{ minHeight: boxHeight }}>
          <div className='chart-area'>
            <MapView
              lat={selWater?.water_lat}
              lng={selWater?.water_lng}
              width={'100%'}
              height={mapHeight}
              ignoreClick
              midnight={theme === 'dark' ? true : false}
              zoom={15}
              // pops={pops}
              addr={fullAddress}
              theme={theme}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
