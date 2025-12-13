import React, { useState } from 'react';
import { IfWeather } from '@/models/weather';
import ChartWeatherPop from '@/app/(admin)/dashbd/dark/chart/ChartWeatherPop';
import ChartWeatherWsd from '@/app/(admin)/dashbd/dark/chart/ChartWeatherWsd';
import useColor from '@/hooks/useColor';

type Props = {
  pops: IfWeather[];
  wsds: IfWeather[];
  resultMsg?: string;
};

export const WeatherForecast = ({ pops, wsds, resultMsg }: Props) => {
  const boxHeight = 395; // 날씨 그래프
  const { button } = useColor(); // color 설정
  const [tabIndex, setTabIndex] = useState<number>(0);

  return (
    <div className='col-xl-8'>
      <div className='card card-chart'>
        <div className='card-header'>
          <div className='row'>
            <div className='col-sm-4 text-left'>
              <h5 className='card-category'>날씨 정보 예측</h5>
              <h2 className='card-title'>{tabIndex === 0 ? '강수확률' : '풍속예측'}</h2>
            </div>
            <div className='col-sm-8'>
              <div className='row'>
                <div className='col-xl-12'>
                  <div
                    className='btn-group btn-group-toggle float-right pt-2'
                    data-toggle='buttons'
                  >
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
                      <span className='d-none d-sm-block d-md-block d-lg-block d-xl-block'>
                        강수확률
                      </span>
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
                      <span className='d-none d-sm-block d-md-block d-lg-block d-xl-block'>
                        풍속예측
                      </span>
                      <span className='d-block d-sm-none'></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='card-body' style={{ minHeight: boxHeight }}>
          {tabIndex === 0 ? (
            <ChartWeatherPop data={pops} resultMsg={resultMsg} />
          ) : (
            <ChartWeatherWsd data={wsds} resultMsg={resultMsg} />
          )}
        </div>
      </div>
    </div>
  );
};
