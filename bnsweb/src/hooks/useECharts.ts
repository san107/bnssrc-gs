import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

type EChartsOption = echarts.EChartsOption;

interface UseEChartsProps {
  onResize?: () => void;
}

// 차트를 띄우고 다른 페이지 이동 시 차트 dispose 문제 발생
// 컴포넌트 언마운트 후 리사이즈 시도를 방지
// 차트 dispose 전에 observer를 정리
export const useECharts = ({ onResize }: UseEChartsProps = {}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts>(null);

  useEffect(() => {
    const chartDom = chartRef.current!;
    chartInstance.current = echarts.init(chartDom);
    let isDisposed = false;

    const resizeObserver = new ResizeObserver((_entries) => {
      if (chartInstance.current && !isDisposed) {
        try {
          chartInstance.current.resize();
          onResize?.();
        } catch (e) {
          console.warn('Failed to resize chart:', e);
        }
      }
    });

    resizeObserver.observe(chartDom);

    return () => {
      isDisposed = true;
      resizeObserver.disconnect();
      if (chartInstance.current) {
        echarts.dispose(chartDom);
        chartInstance.current = null;
      }
    };
  }, [onResize]);

  const setOption = (option: EChartsOption, notMerge: boolean = true) => {
    if (chartInstance.current) {
      chartInstance.current.setOption(option, notMerge);
    }
  };

  return {
    chartRef,
    chartInstance,
    setOption,
  };
};
