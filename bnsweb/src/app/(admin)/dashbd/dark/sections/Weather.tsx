import React, { useEffect, useState } from 'react';
import BoxWeather from '@/app/(admin)/dashbd/dark/box/BoxWeather';
import { IfTbWater } from '@/models/water/tb_water';
import useColor from '@/hooks/useColor';
import * as weatherutils from '@/utils/weather-utils';
import useAddress from '@/hooks/useAddress';

type Props = {
  selWater: IfTbWater;
  isMobile: boolean;
};

export const Weather = ({ selWater, isMobile }: Props) => {
  const boxHeight = 476; // 날씨정보
  const { block, text } = useColor();
  const { address } = useAddress(selWater);
  const [clock, setClock] = useState<string | undefined>('현재시간');

  useEffect(() => {
    setClock(weatherutils.displayClock);
    const id = setInterval(() => {
      setClock(weatherutils.displayClock);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className='col-xl-4'>
      <div className='card card-user'>
        <div className='card-body' style={{ minHeight: isMobile ? '760px' : boxHeight }}>
          <div className='card-text'>
            <div className={block ? block : 'author'}>
              <div className='block block-one'></div>
              <div className='block block-two'></div>
              <div className='block block-three'></div>
              <div className='block block-four'></div>
              <a href='javascript:void(0)'>
                <h5 className='title'>현재 날씨 정보</h5>
              </a>
              <p className='description'>{address}</p>
            </div>
          </div>
          <div className={text ? text : 'card-description'}>{clock}</div>
          <div>
            <BoxWeather water={selWater} />
          </div>
        </div>
      </div>
    </div>
  );
};
