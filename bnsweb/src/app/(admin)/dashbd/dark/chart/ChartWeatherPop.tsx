import React, { useEffect } from 'react';
import { IfWeather } from '@/models/weather';
import * as echarts from 'echarts';
import * as weatherutils from '@/utils/weather-utils';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useECharts } from '@/hooks/useECharts';

type Props = {
  data?: IfWeather[];
  resultMsg?: string;
};

type EChartsOption = echarts.EChartsOption;

const containerStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '260px',
  width: '100%',
};

const Graph = ({ data }: { data: IfWeather[] }) => {
  const { theme } = useSettingsStore();
  const { chartRef, setOption } = useECharts();

  useEffect(() => {
    const dateList = data?.map((item) =>
      weatherutils.strToDatetime(item?.fcstDate || '', item?.fcstTime || '')
    );
    const valueList = data?.map((item) => {
      const value = Number(item?.fcstValue);
      return {
        value: value,
        symbolSize: value === 0 ? 0 : 8,
      };
    });

    const option: EChartsOption = {
      title: {
        text: '시간대별 강수확률 (단위: %)',
        left: 'center',
        top: 0,
        textStyle: {
          color: theme === 'dark' ? '#fff' : '#333',
          fontSize: 14,
          fontWeight: 500,
        },
      },
      visualMap: {
        show: false,
        type: 'continuous',
        seriesIndex: 0,
        dimension: 0,
        min: 0,
        max: dateList.length - 1,
      },
      tooltip: {
        trigger: 'none',
        axisPointer: {
          type: 'cross',
        },
      },
      grid: {
        top: 30,
        bottom: 10,
        left: 50,
        right: 70,
        containLabel: true,
      },
      xAxis: [
        {
          type: 'category',
          axisTick: {
            alignWithLabel: true,
          },
          axisLine: {
            onZero: false,
            lineStyle: {
              color: '#c75859',
            },
          },
          axisLabel: {
            color: '#868689',
          },
          axisPointer: {
            label: {
              formatter: function (params) {
                return (
                  params.value +
                  ' 예측 강수확률' +
                  (params.seriesData.length ? ': ' + params.seriesData[0].value + '%' : '')
                );
              },
            },
          },
          data: dateList,
        },
      ],
      yAxis: {
        gridIndex: 0,
        max: 100,
        type: 'value',
        splitLine: {
          lineStyle: {
            color: theme === 'dark' ? '#392d4b' : '#E0E6F1',
          },
        },
        axisLabel: {
          color: '#868689',
        },
        axisLine: {
          onZero: false,
          lineStyle: {
            color: '#c75859',
          },
        },
      },
      series: [
        {
          type: 'line',
          showSymbol: true,
          symbolSize: 8,
          sampling: 'lttb',
          itemStyle: {
            color: 'rgb(255, 70, 131)',
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: 'rgb(255, 158, 68)',
              },
              {
                offset: 1,
                color: 'rgb(255, 70, 131)',
              },
            ]),
          },
          data: valueList,
          label: {
            show: false,
            position: 'top',
            distance: 5,
            formatter: '{c}%',
            color: theme === 'dark' ? '#fff' : '#3b3642',
            fontSize: 11,
          },
          markPoint: {
            data: [
              {
                type: 'max',
                name: '최고값',
                itemStyle: {
                  color: 'rgba(255, 96, 68, 0.6)',
                },
              },
              {
                type: 'min',
                name: '최저값',
                itemStyle: {
                  color: 'rgba(68, 127, 255, 0.6)',
                },
              },
            ],
            label: {
              formatter: '{c}%',
              color: theme === 'dark' ? '#fff' : '#3b3642',
            },
          },
          markLine: {
            data: [
              {
                type: 'average',
                name: '평균',
                lineStyle: {
                  color: theme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : '#918f94',
                  type: 'dashed',
                },
                label: {
                  formatter: '평균: {c}%',
                  color: theme === 'dark' ? '#fff' : '#3b3642',
                  position: 'end',
                },
              },
            ],
          },
        },
      ],
    };

    setOption(option);
  }, [data, theme, setOption]);
  return (
    <div
      style={{
        width: '100%',
        height: '260px',
        position: 'relative',
        backgroundColor: theme === 'dark' ? '#27293d' : '#fff',
      }}
    >
      <div ref={chartRef} style={{ width: '100%', height: '100%', position: 'absolute' }}></div>
    </div>
  );
};

const WeatherStats = ({ data }: { data: IfWeather[] }) => {
  const { theme } = useSettingsStore();

  const calculateStats = () => {
    if (!data || data.length === 0) return null;

    const values = data.map((item) => Number(item.fcstValue));
    const max = Math.max(...values);
    const min = Math.min(...values);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const highProbCount = values.filter((v) => v >= 70).length; // 70% 이상의 강수확률 횟수

    return {
      max,
      min,
      avg: Math.round(avg * 10) / 10,
      highProbCount,
    };
  };

  const stats = calculateStats();
  if (!stats) return null;

  return (
    <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 px-4'>
      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-[#2d2f45]' : 'bg-gray-50'}`}>
        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          최고 강수확률
        </div>
        <div
          className={`text-xl font-semibold mt-1 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}
        >
          {stats.max}%
        </div>
      </div>
      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-[#2d2f45]' : 'bg-gray-50'}`}>
        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          최저 강수확률
        </div>
        <div
          className={`text-xl font-semibold mt-1 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}
        >
          {stats.min}%
        </div>
      </div>
      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-[#2d2f45]' : 'bg-gray-50'}`}>
        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          평균 강수확률
        </div>
        <div
          className={`text-xl font-semibold mt-1 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}
        >
          {stats.avg}%
        </div>
      </div>
      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-[#2d2f45]' : 'bg-gray-50'}`}>
        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          높은 강수확률 구간 (70% 이상)
        </div>
        <div
          className={`text-xl font-semibold mt-1 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}
        >
          {stats.highProbCount}회
        </div>
      </div>
    </div>
  );
};

const ChartWeatherPop = ({ data, resultMsg }: Props) => {
  return (
    <div>
      {resultMsg && data ? (
        <>
          <Graph data={data || []} />
          <WeatherStats data={data || []} />
        </>
      ) : resultMsg === 'ERROR' || resultMsg === 'NO_DATA' ? (
        <div style={containerStyle}>
          <span style={{ color: 'red' }}>날씨 정보를 불러올 수 없습니다.</span>
        </div>
      ) : (
        <div style={containerStyle}>
          <span className='load-weather'>날씨 정보를 불러오는 중입니다</span>
        </div>
      )}
    </div>
  );
};

export default ChartWeatherPop;
