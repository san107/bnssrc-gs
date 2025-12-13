import React, { useEffect, useState, useCallback } from 'react';
import { IfWeather } from '@/models/weather';
import * as echarts from 'echarts';
import * as weatherutils from '@/utils/weather-utils';
import { useMobile } from '@/hooks/useMobile';
import { Box, CircularProgress, Typography } from '@mui/material';

type Props = {
  data?: IfWeather[];
  name?: string;
  resultMsg?: string;
};

type EChartsOption = echarts.EChartsOption;

const WeatherStats = ({ data, resultMsg }: { data: IfWeather[]; resultMsg?: string }) => {
  const { isMobile } = useMobile();
  const calculateStats = () => {
    if (!data || data.length === 0) return null;

    const values = data.map((item) => Number(item.fcstValue));
    const max = Math.max(...values);
    const min = Math.min(...values);

    return {
      max,
      min,
      yesterday: weatherutils.getYesterdayPopRate(data),
      today: weatherutils.getTodayPopRate(data),
    };
  };

  const stats = calculateStats();
  const isLoading = resultMsg === undefined;
  const hasError = resultMsg === 'ERROR' || resultMsg === 'NO_DATA';

  if (isLoading || hasError || !stats) return null;

  return (
    <div
      className='grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 px-4'
      style={{ paddingTop: isMobile ? '50px' : '0px' }}
    >
      <div className='p-4 rounded-lg bg-gray-50 shadow-sm hover:shadow-md transition-shadow'>
        <div className='text-sm text-gray-600'>전일강우</div>
        <div className='text-xl font-semibold mt-1 text-gray-900'>{stats.yesterday}%</div>
      </div>
      <div className='p-4 rounded-lg bg-gray-50 shadow-sm hover:shadow-md transition-shadow'>
        <div className='text-sm text-gray-600'>금일강우</div>
        <div className='text-xl font-semibold mt-1 text-gray-900'>{stats.today}%</div>
      </div>
      <div className='p-4 rounded-lg bg-gray-50 shadow-sm hover:shadow-md transition-shadow'>
        <div className='text-sm text-gray-600'>최고 강수확률</div>
        <div className='text-xl font-semibold mt-1 text-gray-900'>{stats.max}%</div>
      </div>
      <div className='p-4 rounded-lg bg-gray-50 shadow-sm hover:shadow-md transition-shadow'>
        <div className='text-sm text-gray-600'>최저 강수확률</div>
        <div className='text-xl font-semibold mt-1 text-gray-900'>{stats.min}%</div>
      </div>
    </div>
  );
};

const Graph = ({
  data,
  name,
  resultMsg,
}: {
  data: IfWeather[];
  name: string;
  resultMsg?: string;
}) => {
  const refMian = React.useRef<HTMLDivElement>(null);
  const myChart = React.useRef<echarts.ECharts>(null);
  const [timeRange, setTimeRange] = useState<string>('all');
  const { isMobile } = useMobile();

  // 로딩 상태 확인
  const isLoading = resultMsg === undefined;
  const hasError = resultMsg === 'ERROR' || resultMsg === 'NO_DATA';
  const hasData = data && data.length > 0 && name;

  useEffect(() => {
    if (data && name && !isLoading && !hasError) {
      const chartDom = refMian.current!;
      myChart.current = echarts.init(chartDom);

      const handleResize = () => {
        myChart.current?.resize();
      };
      window.addEventListener('resize', handleResize);

      // 초기화 버튼 클릭 이벤트 리스너 추가
      const handleRestore = () => {
        setTimeRange('all');
      };

      // 이벤트 리스너 등록
      myChart.current.on('restore', handleRestore);

      return () => {
        window.removeEventListener('resize', handleResize);
        // 이벤트 리스너 제거
        myChart.current?.off('restore', handleRestore);
        myChart.current?.dispose();
      };
    }
  }, [data, name, isLoading, hasError]);

  const getFilteredData = useCallback(() => {
    if (!data) return { dateList: [], valueList: [] };

    let filteredData = [...data];
    if (timeRange !== 'all') {
      const now = new Date();
      const hours = parseInt(timeRange);

      // 현재 시간부터 지정된 시간 후까지의 범위 계산
      const startTime = new Date(now.getTime());
      const endTime = new Date(now.getTime() + hours * 60 * 60 * 1000);

      filteredData = data.filter((item) => {
        const itemDate = new Date(
          weatherutils.strToDatetime(item?.fcstDate || '', item?.fcstTime || '')
        );

        // 현재 시간부터 지정된 시간 후까지의 범위에 포함되는지 확인
        const isInRange = itemDate >= startTime && itemDate <= endTime;

        return isInRange;
      });
    }

    // 시간순으로 정렬
    filteredData.sort((a, b) => {
      const dateA = new Date(weatherutils.strToDatetime(a?.fcstDate || '', a?.fcstTime || ''));
      const dateB = new Date(weatherutils.strToDatetime(b?.fcstDate || '', b?.fcstTime || ''));
      return dateA.getTime() - dateB.getTime();
    });

    // 데이터를 인덱스와 함께 매핑
    const mappedData = filteredData.map((item, index) => {
      const date = weatherutils.strToDatetime(item?.fcstDate || '', item?.fcstTime || '');
      const dateObj = new Date(date);
      const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
      const day = dateObj.getDate().toString().padStart(2, '0');
      const hour = dateObj.getHours().toString().padStart(2, '0');
      const label = `${month}/${day} ${hour}시`;

      return {
        index,
        label,
        value: Number(item?.fcstValue),
        originalItem: item,
      };
    });

    return {
      dateList: mappedData.map((item) => item.label),
      valueList: mappedData.map((item) => item.value),
      mappedData,
    };
  }, [data, timeRange]);

  useEffect(() => {
    if (myChart.current && !isLoading && !hasError) {
      const { dateList, valueList } = getFilteredData();

      // 데이터 개수에 따라 라벨 간격 계산
      const calculateInterval = (dataLength: number) => {
        if (dataLength <= 6) return 0;
        if (dataLength <= 12) return 1;
        if (dataLength <= 24) return 2;
        if (dataLength <= 48) return 3;
        return Math.floor(dataLength / 8);
      };

      const labelInterval = calculateInterval(dateList.length);

      const option: EChartsOption = {
        title: {
          left: 'center',
          top: '5%',
          text: name ? `강수확률 (${name})` : '강수확률',
        },
        tooltip: {
          trigger: 'axis',
          valueFormatter: (value) => `${value}%`,
          formatter: (params: any) => {
            const date = params[0].axisValue;
            const value = params[0].value;
            return `${date}<br/>강수확률: ${value}%`;
          },
        },
        toolbox: {
          show: true,
          left: 'right',
          top: 'top',
          feature: {
            restore: {
              title: '초기화',
            },
            saveAsImage: {
              title: '이미지 저장',
              pixelRatio: 2,
            },
          },
          itemSize: 20,
          itemGap: 10,
          right: 'auto',
          width: 'auto',
          height: 'auto',
          showTitle: true,
        },
        dataZoom: [
          {
            type: 'slider',
            show: true,
            xAxisIndex: [0],
            start: 0,
            end: 100,
            height: 30,
            bottom: 0,
            borderColor: 'transparent',
            backgroundColor: '#f5f5f5',
            fillerColor: 'rgba(0,137,210,0.2)',
            handleStyle: {
              color: '#0089D2',
              borderWidth: 10,
              borderColor: '#0089D2',
              borderRadius: 0,
            },
          },
          {
            type: 'inside',
            xAxisIndex: [0],
            start: 0,
            end: 100,
          },
        ],
        grid: {
          left: '5%',
          right: '5%',
          bottom: '15%',
          top: '15%',
        },
        xAxis: {
          type: 'category',
          boundaryGap: true,
          data: dateList,
          axisLabel: {
            interval: labelInterval, // 동적으로 계산된 간격 사용
            fontSize: 10,
            formatter: (value) => {
              return value;
            },
          },
          axisTick: {
            alignWithLabel: true,
          },
        },
        yAxis: {
          type: 'value',
          gridIndex: 0,
          max: 100,
          axisLabel: {
            formatter: '{value}%',
          },
          splitLine: {
            lineStyle: {
              type: 'dashed',
            },
          },
        },
        series: [
          {
            type: 'bar',
            name: name,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#83bff6' },
                { offset: 0.5, color: '#188df0' },
                { offset: 1, color: '#188df0' },
              ]),
            },
            showBackground: true,
            backgroundStyle: {
              color: 'rgba(180, 180, 180, 0.1)',
              borderRadius: [4, 4, 0, 0],
            },
            data: valueList,
            barWidth: '60%',
            emphasis: {
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: '#2378f7' },
                  { offset: 0.7, color: '#2378f7' },
                  { offset: 1, color: '#83bff6' },
                ]),
              },
            },
          },
          {
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 8,
            itemStyle: {
              color: '#00ADAC',
              borderWidth: 2,
            },
            lineStyle: {
              width: 3,
              shadowColor: 'rgba(0,0,0,0.3)',
              shadowBlur: 10,
              shadowOffsetY: 5,
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(0,173,172,0.3)' },
                { offset: 1, color: 'rgba(0,173,172,0.1)' },
              ]),
            },
            data: valueList,
          },
        ],
        animation: true,
        animationDuration: 1000,
        animationEasing: 'cubicInOut',
      };

      myChart.current.setOption(option);
    }
  }, [data, name, timeRange, getFilteredData, isLoading, hasError]);

  return (
    <div>
      <div
        style={{
          width: '100%',
          height: isMobile ? '300px' : '450px',
          position: 'relative',
          backgroundColor: '#efefef',
          paddingTop: isMobile ? '50px' : '0px',
        }}
      >
        {isLoading ? (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <CircularProgress size={40} />
            <Typography variant='body2' color='text.primary'>
              날씨 데이터를 불러오는 중입니다...
            </Typography>
          </Box>
        ) : hasError ? (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
            }}
          >
            <Typography variant='body1' color='error'>
              {resultMsg === 'ERROR'
                ? '데이터를 불러오는 중 오류가 발생했습니다.'
                : '데이터가 없습니다.'}
            </Typography>
          </Box>
        ) : hasData ? (
          <div ref={refMian} style={{ width: '100%', height: '100%', position: 'absolute' }}></div>
        ) : (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            지역을 선택해주세요.
          </div>
        )}

        {/* 시간 선택 버튼들을 차트 위에 오버레이로 배치 */}
        {hasData && (
          <div
            style={{
              position: 'absolute',
              top: isMobile ? '15px' : '10px',
              left: '10px',
              zIndex: 10,
            }}
          >
            <div className='flex space-x-2'>
              <button
                onClick={() => setTimeRange('all')}
                className={`px-3 py-1 text-sm rounded ${
                  timeRange === 'all'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-300'
                }`}
              >
                전체
              </button>
              <button
                onClick={() => setTimeRange('24')}
                className={`px-3 py-1 text-sm rounded ${
                  timeRange === '24'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-300'
                }`}
              >
                24시간
              </button>
              <button
                onClick={() => setTimeRange('12')}
                className={`px-3 py-1 text-sm rounded ${
                  timeRange === '12'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-300'
                }`}
              >
                12시간
              </button>
              <button
                onClick={() => setTimeRange('6')}
                className={`px-3 py-1 text-sm rounded ${
                  timeRange === '6'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-300'
                }`}
              >
                6시간
              </button>
            </div>
          </div>
        )}
      </div>
      <WeatherStats data={data || []} resultMsg={resultMsg} />
    </div>
  );
};

const ChartWeather = ({ data, name, resultMsg }: Props) => {
  return (
    <div>
      <Graph data={data || []} name={name || ''} resultMsg={resultMsg} />
    </div>
  );
};

export default ChartWeather;
