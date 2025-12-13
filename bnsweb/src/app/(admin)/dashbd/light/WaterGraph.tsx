// @flow
import { isWaterEvt, useWsMsg } from '@/app/ws/useWsMsg';
import { useInterval } from '@/hooks/useInterval';
import { useRefresh } from '@/hooks/useRefresh';
import { IfTbWater } from '@/models/water/tb_water';
import { IfTbWaterHist, TbWaterHist } from '@/models/water/tb_water_hist';
import { tofixedceil } from '@/utils/num-utils';
import { Box } from '@mui/material';
import * as echarts from 'echarts';
import * as React from 'react';
import { useEffect, useState } from 'react';
import useSWR from 'swr';

type Props = {
  water: IfTbWater;
  hours: number;
};

type EChartsOption = echarts.EChartsOption;
const Graph = ({
  list,
  water,
  maxLevel,
}: {
  list: IfTbWaterHist[];
  water: IfTbWater;
  maxLevel: number;
}) => {
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

  const [showTooltips, setShowTooltips] = useState(true);

  React.useEffect(() => {
    const option: EChartsOption = {
      grid: { left: '50px', top: '30px', right: '20px', bottom: '30px' },
      toolbox: {
        showTitle: false,
        feature: {
          dataZoom: {
            yAxisIndex: 'none',
            title: { zoom: '줌', back: '줌 리셋' },
            brushStyle: { color: '#0003' },
          },
          restore: { title: '갱신' },
          saveAsImage: { title: '이미지로 저장' },
          myTool1: {
            show: true,
            title: showTooltips ? '툴팁 숨기기' : '툴팁 보이기',
            //icon: 'path://M432.45,595.444c0,2.177-4.661,6.82-11.305,6.82c-6.475,0-11.306-4.567-11.306-6.82s4.852-6.812,11.306-6.812C427.841,588.632,432.452,593.191,432.45,595.444L432.45,595.444z M421.155,589.876c-3.009,0-5.448,2.495-5.448,5.572s2.439,5.572,5.448,5.572c3.01,0,5.449-2.495,5.449-5.572C426.604,592.371,424.165,589.876,421.155,589.876L421.155,589.876z M421.146,591.891c-1.916,0-3.47,1.589-3.47,3.549c0,1.959,1.554,3.548,3.47,3.548s3.469-1.589,3.469-3.548C424.614,593.479,423.062,591.891,421.146,591.891L421.146,591.891zM421.146,591.891',
            icon: showTooltips
              ? 'path://m89.752 59.582l362.667 362.667l-30.17 30.17l-59.207-59.208c-29.128 19.7-64.646 33.456-107.042 33.456C106.667 426.667 42.667 256 42.667 256s22.862-60.965 73.141-110.02L59.582 89.751zM256 85.334C405.334 85.334 469.334 256 469.334 256s-14.239 37.97-44.955 78.09l-95.84-95.863c-6.582-26.955-27.796-48.173-54.748-54.76l-85.462-85.485c20.252-7.905 42.776-12.648 67.671-12.648M181.334 256c0 41.238 33.43 74.667 74.666 74.667c12.86 0 24.959-3.25 35.522-8.975l-33.741-33.74q-.885.048-1.78.048c-17.674 0-32-14.327-32-32q0-.896.048-1.781l-33.74-33.74c-5.725 10.563-8.975 22.662-8.975 35.521'
              : 'path://M396 512a112 112 0 1 0 224 0a112 112 0 1 0-224 0m546.2-25.8C847.4 286.5 704.1 186 512 186c-192.2 0-335.4 100.5-430.2 300.3a60.3 60.3 0 0 0 0 51.5C176.6 737.5 319.9 838 512 838c192.2 0 335.4-100.5 430.2-300.3c7.7-16.2 7.7-35 0-51.5M508 688c-97.2 0-176-78.8-176-176s78.8-176 176-176s176 78.8 176 176s-78.8 176-176 176',
            onclick: () => setShowTooltips((v) => !v),
          },
        },
        tooltip: {
          show: true,
          formatter: (param) => '<div>' + param.title + '</div>', // user-defined DOM structure
          backgroundColor: '#fff',
          textStyle: { fontSize: 12 },
          extraCssText: 'box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);', // user-defined CSS styles
        },
      },
      tooltip: showTooltips
        ? {
            trigger: 'axis',
            // position: function (pt) {
            //   //console.log('pt', pt);
            //   return [pt[0] + 2, -15];
            // },
            axisPointer: { type: 'cross' },
            formatter: (e) => {
              if (e[0].value[1] === undefined) {
                return '';
              }
              return e[0].value[1] + 'm';
            },
          }
        : {},
      animation: false, // 에니메이션 효과 여부.
      dataset: {
        source: list.map((ele) => [
          ele.water_dt,
          ele.water_level,
          water.limit_attn,
          water.limit_warn! - water.limit_attn!,
          water.limit_alert! - water.limit_warn!,
          water.limit_crit! - water.limit_alert!,
          maxLevel,
        ]),
        dimensions: ['time', 'water_level', 'normal', 'attn', 'warn', 'alert', 'crit'],
      },
      xAxis: { type: 'time' },
      yAxis: {
        type: 'value',
        max: maxLevel,
        axisLabel: {
          formatter: '{value}m',
          fontSize: 14,
          //fontWeight: 'bold',
        },
      },
      series: [
        {
          name: 'normal',
          encode: { x: 'time', y: 'normal' },
          type: 'line',
          stack: 'back',
          color: '#22c52e55',
          areaStyle: {},
          smooth: true,
          symbol: 'none',
        },
        {
          encode: { x: 'time', y: 'attn' },
          type: 'line',
          stack: 'back',
          color: '#3b82f655',
          areaStyle: {},
          smooth: true,
          symbol: 'none',
        },
        {
          encode: { x: 'time', y: 'warn' },
          type: 'line',
          stack: 'back',
          color: '#f59e0b55',
          areaStyle: {},
          smooth: true,
          symbol: 'none',
        },
        {
          encode: { x: 'time', y: 'alert' },
          type: 'line',
          stack: 'back',
          color: '#f9731655',
          areaStyle: {},
          smooth: true,
          symbol: 'none',
        },
        {
          encode: { x: 'time', y: 'crit' },
          type: 'line',
          stack: 'back',
          color: '#ef444455',
          symbol: 'none',
          areaStyle: {},
          smooth: true,
        },
        {
          //name: 'water_level',
          type: 'line',
          encode: { x: 'time', y: 'water_level' },
          smooth: true,
          showSymbol: false,
          symbol: 'circle',
          symbolSize: 5,
          lineStyle: { color: '#0000ff', width: 2 },
        },
      ],
    };

    if (myChart.current) myChart.current.setOption(option, true);
  }, [
    list,
    maxLevel,
    water.limit_alert,
    water.limit_attn,
    water.limit_crit,
    water.limit_warn,
    showTooltips,
  ]);
  return (
    <div style={{ width: '100%', height: '350px', position: 'relative', border: '1px solid #ccc' }}>
      <div ref={refMian} style={{ width: '100%', height: '100%', position: 'absolute' }}></div>
    </div>
  );
};

export const WaterGraph = (props: Props) => {
  const { data: list, mutate: mutateWaterHist } = useSWR<IfTbWaterHist[]>(
    props.water.water_dev_id && [
      '/api/water_hist/list',
      { waterDevId: props.water.water_dev_id, limit: props.hours * 60, limitHour: props.hours },
    ]
  );
  const [listLocal, setListLocal] = useState<IfTbWaterHist[]>([]);

  const [refreshId, refresh] = useRefresh();

  useWsMsg((msg) => {
    if (isWaterEvt(msg)) {
      mutateWaterHist();
    }
  });

  const { restart } = useInterval(70 * 1000, false, () => {
    console.log('interval called');
    refresh();
    mutateWaterHist();
  });

  useEffect(() => {
    console.log('changed water hists');
    restart();
  }, [list, restart]);

  const maxval = React.useMemo(() => {
    const fillNoData = (acc: IfTbWaterHist[], dt1: Date, dt2: Date) => {
      //
      while (dt1.getTime() - dt2.getTime() > 70 * 1000) {
        // 다음 데이터와 1분이상 차이가 나면 안나는 시점까지 빈데이터 추가함.
        const obj = new TbWaterHist();
        dt2 = new Date(dt2.getTime() + 60 * 1000);
        obj.water_dt = dt2.toISOString();
        acc.push(obj);
        //console.log('obj is ', obj);
      }
    };
    if (list?.length === 0) {
      // 데이터가 없을때도 5시간전부터 빈값으로 출력.
      const acc: IfTbWaterHist[] = [];
      const dt1 = new Date();
      const dt2 = new Date(dt1.getTime() - props.hours * 60 * 60 * 1000);
      fillNoData(acc, dt1, dt2);
      setListLocal(acc);
    } else {
      setListLocal(
        list
          ?.slice(0)
          .reverse()
          .reduce<IfTbWaterHist[]>((acc, cur, idx) => {
            if (acc.length === 0) {
              // 처음데이터 비교.. 데이터가 없더라도 5시간전부터 출력하도록 .
              const dt1 = new Date(cur.water_dt!);
              const dt2 = new Date();
              dt2.setTime(dt2.getTime() - props.hours * 60 * 60 * 1000);
              fillNoData(acc, dt1, dt2);
              acc.push(cur);
              return acc;
            }
            const last = acc[acc.length - 1];
            const dt1 = new Date(cur.water_dt!);
            const dt2 = new Date(last.water_dt!);
            fillNoData(acc, dt1, dt2);
            // 다음 데이터와 1분이상 차이가 나면 안나는 시점까지 빈데이터 추가함.
            acc.push(cur);

            if (idx === list.length - 1) {
              // 마지막 데이터의 경우.
              const dt1 = new Date();
              const dt2 = new Date(cur.water_dt!);
              fillNoData(acc, dt1, dt2);
            }

            return acc;
          }, []) ?? []
      );
    }
    const max = Math.max(...(list || []).map((ele) => ele.water_level ?? 0));
    if (max < (props.water.limit_crit ?? 0) * 2 - (props.water.limit_alert ?? 0)) {
      return tofixedceil((props.water.limit_crit ?? 0) * 2 - (props.water.limit_alert ?? 0), 1);
    }

    return tofixedceil(max, 1);
    // eslint-disable-next-line
  }, [list, props.water.limit_alert, props.water.limit_crit, refreshId]); // refreshId가 있어야 5시간전부터 빈값으로 출력함.

  return (
    <Box>
      <Graph list={listLocal} water={props.water} maxLevel={maxval} />
    </Box>
  );
};
