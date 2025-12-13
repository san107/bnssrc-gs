import React, { useEffect } from 'react';
import * as echarts from 'echarts';
import { useSettingsStore } from '@/store/useSettingsStore';

type Props = {
  data?: number;
};

type EChartsOption = echarts.EChartsOption;

const Graph = ({ data }: { data: number }) => {
  const refMian = React.useRef<HTMLDivElement>(null);
  const myChart = React.useRef<echarts.ECharts>(null);
  const { theme } = useSettingsStore();

  useEffect(() => {
    const chartDom = refMian.current!;
    myChart.current = echarts.init(chartDom);
    // const resizeObserver = new ResizeObserver((_entries) => {
    //   if (myChart.current) myChart.current.resize();
    // });
    // resizeObserver.observe(refMian.current!);
    // return () => {
    //   echarts?.dispose(chartDom);
    // };
  }, []);

  useEffect(() => {
    const option: EChartsOption = {
      series: [
        {
          type: 'gauge',
          progress: {
            show: true,
            // width: 18,
            width: 8,
          },
          axisLine: {
            lineStyle: {
              // width: 18,
              width: 8,
            },
          },
          axisTick: {
            show: false,
          },
          splitLine: {
            length: 15,
            lineStyle: {
              width: 1,
              color: '#999',
            },
          },
          axisLabel: {
            // distance: 25,
            distance: -40,
            color: '#999',
            fontSize: 10,
          },
          anchor: {
            show: true,
            showAbove: true,
            size: 5,
            itemStyle: {
              borderWidth: 10,
            },
          },
          title: {
            show: false,
          },
          detail: {
            valueAnimation: true,
            fontSize: 20,
            offsetCenter: [0, '70%'],
            formatter: '{value}%',
            color: '#FD7347',
          },
          data: [
            {
              value: Number(data),
              // value: 30,
            },
          ],
        },
      ],
    };

    if (myChart.current) myChart.current.setOption(option);
  }, [data, theme]);
  return (
    <div
      style={{
        width: '100%',
        height: '180px',
        // position: 'relative',
        // backgroundColor: '#fff',
        backgroundColor: theme === 'dark' ? '#27293d' : '#fff',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div ref={refMian} style={{ width: 180, height: 180, position: 'absolute' }}></div>
    </div>
  );
};

const ChartWeatherPopGauge = ({ data }: Props) => {
  return <Graph data={data || 0} />;
};

export default ChartWeatherPopGauge;
