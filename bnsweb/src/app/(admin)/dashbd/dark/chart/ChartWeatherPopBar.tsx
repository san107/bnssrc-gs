import React, { useEffect } from 'react';
import { IfWeather } from '@/models/weather';
import * as echarts from 'echarts';
import * as weatherutils from '@/utils/weather-utils';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useECharts } from '@/hooks/useECharts';

type Props = {
  data?: IfWeather[];
  addr?: string;
};

type EChartsOption = echarts.EChartsOption;

const Graph = ({ data, addr }: Props) => {
  const { theme } = useSettingsStore();
  const { chartRef, setOption } = useECharts();

  useEffect(() => {
    const { date } = weatherutils.getToday();
    const todayList = data?.filter((item) => item?.fcstDate === date);
    const dateList = todayList?.map((item) => weatherutils.strToTime(item?.fcstTime || ''));
    const valueList = todayList?.map((item) => item?.fcstValue);

    const option: EChartsOption = {
      title: {
        left: 'center',
        text: `강수확률 (${weatherutils.strToDate(date)})`,
        subtext: addr,
        textStyle: {
          color: theme === 'dark' ? '#fae100' : '#6C6E9C',
          fontSize: 24,
          fontWeight: 400,
        },
        subtextStyle: {
          color: theme === 'dark' ? '#bdb765' : '#8C8C8C',
          fontSize: 18,
          fontWeight: 400,
        },
      },
      xAxis: {
        data: dateList,
        type: 'category',
        axisTick: {
          alignWithLabel: true,
        },
        axisLine: {
          onZero: false,
        },
        axisLabel: {
          color: '#999',
        },
      },
      yAxis: {
        min: 0,
        max: 100,
        type: 'value',
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          color: '#999',
        },
        splitLine: {
          lineStyle: {
            color: 'transparent',
          },
        },
      },
      dataZoom: [
        {
          type: 'inside',
        },
      ],
      series: [
        {
          type: 'bar',
          showBackground: false,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#83bff6' },
              { offset: 0.5, color: '#188df0' },
              { offset: 1, color: '#188df0' },
            ]),
          },
          emphasis: {
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#2378f7' },
                { offset: 0.7, color: '#2378f7' },
                { offset: 1, color: '#83bff6' },
              ]),
            },
          },
          data: valueList,
        },
        {
          type: 'line',
          itemStyle: { color: '#fae100' },
          data: valueList,
        },
      ],
    };

    setOption(option);
  }, [data, addr, theme, setOption]);

  return (
    <div
      style={{
        width: '100%',
        height: '360px',
        position: 'relative',
        backgroundColor: 'transparent',
      }}
    >
      <div ref={chartRef} style={{ width: '100%', height: '100%', position: 'absolute' }}></div>
    </div>
  );
};

const ChartWeatherPopBar = ({ data, addr }: Props) => {
  return <Graph data={data || []} addr={addr} />;
};

export default ChartWeatherPopBar;
