import React, { useEffect } from 'react';
import { IfWeather } from '@/models/weather';
import * as echarts from 'echarts';
import * as weatherutils from '@/utils/weather-utils';

type Props = {
  data?: IfWeather[];
};

type EChartsOption = echarts.EChartsOption;

const Graph = ({ data }: { data: IfWeather[] }) => {
  const refMian = React.useRef<HTMLDivElement>(null);
  const myChart = React.useRef<echarts.ECharts>(null);

  useEffect(() => {
    const chartDom = refMian.current!;
    myChart.current = echarts.init(chartDom);
    const resizeObserver = new ResizeObserver((_entries) => {
      if (myChart.current) myChart.current.resize();
    });
    resizeObserver.observe(refMian.current!);
    return () => {
      echarts?.dispose(chartDom);
    };
  }, []);

  useEffect(() => {
    const dateList = data?.map((item) =>
      weatherutils.strToDatetime(item?.fcstDate || '', item?.fcstTime || '')
    );
    const valueList = data?.map((item) => item?.fcstValue);

    const option: EChartsOption = {
      tooltip: {
        trigger: 'none',
        axisPointer: {
          type: 'cross',
        },
      },
      grid: {
        top: 30,
        bottom: 40,
      },
      xAxis: {
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
        axisPointer: {
          label: {
            formatter: function (params) {
              return (
                params.value +
                ' 예측 풍속' +
                (params.seriesData.length ? ': ' + params.seriesData[0].data + ' m/s' : '')
              );
            },
          },
        },
        boundaryGap: false,
        data: dateList,
      },
      yAxis: {
        type: 'value',
        boundaryGap: [0, '50%'],
        // max: 20,
      },
      series: [
        {
          type: 'line',
          showSymbol: false,
          itemStyle: {
            color: 'rgb(255, 70, 131)',
          },
          data: valueList,
        },
      ],
    };

    if (myChart.current) myChart.current.setOption(option);
  }, [data]);
  return (
    <div
      style={{
        width: '100%',
        height: '240px',
        position: 'relative',
        border: '1px solid #ccc',
        backgroundColor: '#fff',
      }}
    >
      <div ref={refMian} style={{ width: '100%', height: '100%', position: 'absolute' }}></div>
    </div>
  );
};

const WeatherWsdGraph = ({ data }: Props) => {
  return <Graph data={data || []} />;
};

export default WeatherWsdGraph;
