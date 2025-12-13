import React, { useEffect } from 'react';
import * as echarts from 'echarts';
import { IfTbWater } from '@/models/water/tb_water';
import { useSettingsStore } from '@/store/useSettingsStore';

type Props = {
  waters?: IfTbWater[];
};

type EChartsOption = echarts.EChartsOption;

// const labelColor = '#c552e9';

const Graph = ({ waters }: Props) => {
  const refMian = React.useRef<HTMLDivElement>(null);
  const myChart = React.useRef<echarts.ECharts>(null);
  const { theme } = useSettingsStore();
  const labelColor = theme === 'dark' ? '#01ffff' : '#00C9D8';

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
    // 안전 카운트 (수위계)
    const waterNormCnt = (waters || [])?.filter(
      (ele) => !ele.water_stat || ele.water_stat === 'Norm'
    ).length;
    // 관심 카운트 (수위계)
    const waterAttnCnt = (waters || [])?.filter(
      (ele) => !ele.water_stat || ele.water_stat === 'Attn'
    ).length;
    // 주의 카운트 (수위계)
    const waterWarnCnt = (waters || [])?.filter(
      (ele) => !ele.water_stat || ele.water_stat === 'Warn'
    ).length;
    // 경계 카운트 (수위계)
    const waterAlertCnt = (waters || [])?.filter(
      (ele) => !ele.water_stat || ele.water_stat === 'Alert'
    ).length;
    // 심각 카운트 (수위계)
    const waterCritCnt = (waters || [])?.filter(
      (ele) => !ele.water_stat || ele.water_stat === 'Crit'
    ).length;

    console.log('first');
    const colorPalette = ['#19ce61', '#408bff', '#f1b919', '#ff7819', '#fb414a'];
    const option: EChartsOption = {
      tooltip: {
        trigger: 'item',
      },
      legend: {
        bottom: '0',
        left: 'center',
        textStyle: {
          color: theme === 'dark' ? '#dde3e9' : '#6C6E9C',
        },
      },
      series: [
        {
          top: '0',
          height: '250',
          color: colorPalette,
          name: '수위계 상태 카운트',
          type: 'pie',
          radius: '50%',
          label: {
            fontSize: 16,
            color: labelColor,
          },
          labelLine: {
            lineStyle: {
              color: labelColor,
            },
          },
          data: [
            { value: waterNormCnt, name: `안전 (${waterNormCnt})` },
            { value: waterAttnCnt, name: `관심 (${waterAttnCnt})` },
            { value: waterWarnCnt, name: `주의 (${waterWarnCnt})` },
            { value: waterAlertCnt, name: `경계 (${waterAlertCnt})` },
            { value: waterCritCnt, name: `심각 (${waterCritCnt})` },
          ],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        },
      ],
    };

    if (myChart.current) myChart.current.setOption(option);
  }, [waters, theme, labelColor]);
  return (
    <div
      style={{
        width: '100%',
        height: '280px',
        // position: 'relative',
        backgroundColor: theme === 'dark' ? '#27293d' : '#fff',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div ref={refMian} style={{ width: 540, height: 280, position: 'absolute' }}></div>
    </div>
  );
};

const ChartWater = ({ waters }: Props) => {
  return <Graph waters={waters} />;
};

export default ChartWater;
