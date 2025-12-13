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
    const valueList = data?.map((item) => Number(item?.fcstValue) || 0);

    // Calculate statistics
    const maxValue = Math.max(...(valueList || [0]));
    const minValue = Math.min(...(valueList || [0]));
    const avgValue = valueList?.reduce((a, b) => a + b, 0) / (valueList?.length || 1);

    const option: EChartsOption = {
      title: {
        text: '시간대별 풍속예측 (단위: m/s)',
        left: 'center',
        top: 0,
        textStyle: {
          color: theme === 'dark' ? '#fff' : '#333',
          fontSize: 14,
          fontWeight: 500,
        },
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: theme === 'dark' ? 'rgba(50, 50, 50, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        borderColor: theme === 'dark' ? '#392d4b' : '#E0E6F1',
        textStyle: {
          color: theme === 'dark' ? '#fff' : '#333',
        },
        formatter: function (params: any) {
          const value = params[0].value;
          return `시간: ${params[0].axisValue}<br/>
                 풍속: ${value}<br/>
                 최고: ${maxValue.toFixed(1)}<br/>
                 최저: ${minValue.toFixed(1)}<br/>
                 평균: ${avgValue.toFixed(1)}`;
        },
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: theme === 'dark' ? '#392d4b' : '#E0E6F1',
          },
        },
      },
      grid: {
        top: 30,
        bottom: 10,
        left: 50,
        right: 70,
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        axisTick: {
          alignWithLabel: true,
          show: false,
        },
        axisLine: {
          onZero: false,
          lineStyle: {
            color: theme === 'dark' ? '#392d4b' : '#E0E6F1',
          },
        },
        axisLabel: {
          color: theme === 'dark' ? '#868689' : '#666',
          fontSize: 11,
        },
        boundaryGap: false,
        data: dateList,
      },
      yAxis: {
        type: 'value',
        boundaryGap: [0, '50%'],
        min: function (value) {
          return Math.floor(value.min * 0.9);
        },
        max: function (value) {
          return Math.ceil(value.max * 1.1);
        },
        splitLine: {
          lineStyle: {
            color: theme === 'dark' ? '#392d4b' : '#E0E6F1',
            type: 'dashed',
          },
        },
        axisLabel: {
          color: theme === 'dark' ? '#868689' : '#666',
          fontSize: 11,
        },
        axisLine: {
          onZero: false,
          lineStyle: {
            color: theme === 'dark' ? '#392d4b' : '#E0E6F1',
          },
        },
      },
      series: [
        {
          type: 'line',
          showSymbol: true,
          symbol: 'circle',
          symbolSize: 8,
          sampling: 'lttb',
          smooth: true,
          lineStyle: {
            width: 3,
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#FF6B6B' },
              { offset: 1, color: '#4ECDC4' },
            ]),
          },
          itemStyle: {
            color: '#FFFFFF',
            borderWidth: 1,
            borderColor: '#fd6347',
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(255, 107, 107, 0.3)' },
              { offset: 1, color: 'rgba(78, 205, 196, 0.1)' },
            ]),
          },
          markLine: {
            silent: true,
            symbol: 'none',
            label: {
              formatter: '{b}: {c}',
              color: theme === 'dark' ? '#fff' : '#333',
              fontSize: 11,
              position: 'end',
              distance: [0, 0],
            },
            data: [
              {
                name: '최고',
                yAxis: maxValue,
                lineStyle: {
                  color: '#FF6B6B',
                  type: 'dashed',
                },
              },
              {
                name: '최저',
                yAxis: minValue,
                lineStyle: {
                  color: '#4ECDC4',
                  type: 'dashed',
                },
              },
              {
                name: '평균',
                yAxis: avgValue,
                lineStyle: {
                  color: '#FFD93D',
                  type: 'dashed',
                },
              },
            ],
          },
          data: valueList,
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
    const highWindCount = values.filter((v) => v >= 10).length; // 10m/s 이상의 강풍 횟수

    return {
      max,
      min,
      avg: Math.round(avg * 10) / 10,
      highWindCount,
    };
  };

  const stats = calculateStats();
  if (!stats) return null;

  return (
    <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 px-4'>
      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-[#2d2f45]' : 'bg-gray-50'}`}>
        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          최대 풍속
        </div>
        <div
          className={`text-xl font-semibold mt-1 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}
        >
          {stats.max} m/s
        </div>
      </div>
      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-[#2d2f45]' : 'bg-gray-50'}`}>
        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          최소 풍속
        </div>
        <div
          className={`text-xl font-semibold mt-1 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}
        >
          {stats.min} m/s
        </div>
      </div>
      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-[#2d2f45]' : 'bg-gray-50'}`}>
        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          평균 풍속
        </div>
        <div
          className={`text-xl font-semibold mt-1 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}
        >
          {stats.avg} m/s
        </div>
      </div>
      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-[#2d2f45]' : 'bg-gray-50'}`}>
        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          강풍 발생 횟수 (10m/s 이상)
        </div>
        <div
          className={`text-xl font-semibold mt-1 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}
        >
          {stats.highWindCount}회
        </div>
      </div>
    </div>
  );
};

const ChartWeatherWsd = ({ data, resultMsg }: Props) => {
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

export default ChartWeatherWsd;
