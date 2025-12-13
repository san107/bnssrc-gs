// @flow
import { IfTbGate } from '@/models/gate/tb_gate';
import { IfTbGateHist } from '@/models/gate/tb_gate_hist';
import { Box, Paper, Typography } from '@mui/material';
import * as echarts from 'echarts';
import * as React from 'react';
import { useEffect } from 'react';
import useSWR from 'swr';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useMobile } from '@/hooks/useMobile';
import { useECharts } from '@/hooks/useECharts';

type Props = {
  gate: IfTbGate;
  date: string;
};

type EChartsOption = echarts.EChartsOption;

const calculateStatistics = (data: IfTbGateHist[]) => {
  if (!data.length) return null;

  const stats = {
    open: 0,
    close: 0,
    error: 0,
    total: 0,
    dailyStats: new Map<string, { open: number; close: number; error: number }>(),
    maxOpenDay: { date: '', count: 0 },
    maxCloseDay: { date: '', count: 0 },
    maxErrorDay: { date: '', count: 0 },
    avgDailyOperations: 0,
    successRate: 0,
    errorRate: 0,
  };

  data.forEach((item) => {
    if (!item.update_dt) return;
    const stat = item.gate_stat as 'UpOk' | 'UpLock' | 'DownOk' | 'Stop' | 'Na' | undefined;
    if (!stat) return;

    const date = new Date(item.update_dt);
    const dayStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
      date.getDate()
    ).padStart(2, '0')}`;

    if (!stats.dailyStats.has(dayStr)) {
      stats.dailyStats.set(dayStr, { open: 0, close: 0, error: 0 });
    }

    const dayStats = stats.dailyStats.get(dayStr)!;

    if (stat === 'UpOk' || stat === 'UpLock') {
      stats.open++;
      dayStats.open++;
      if (dayStats.open > stats.maxOpenDay.count) {
        stats.maxOpenDay = { date: dayStr, count: dayStats.open };
      }
    } else if (stat === 'DownOk') {
      stats.close++;
      dayStats.close++;
      if (dayStats.close > stats.maxCloseDay.count) {
        stats.maxCloseDay = { date: dayStr, count: dayStats.close };
      }
    } else if (stat === 'Stop' || stat === 'Na') {
      stats.error++;
      dayStats.error++;
      if (dayStats.error > stats.maxErrorDay.count) {
        stats.maxErrorDay = { date: dayStr, count: dayStats.error };
      }
    }
    stats.total++;
  });

  // 평균 작동 횟수, 성공률, 오류율 계산
  const totalDays = stats.dailyStats.size;
  stats.avgDailyOperations = totalDays > 0 ? stats.total / totalDays : 0;
  stats.successRate = stats.total > 0 ? ((stats.open + stats.close) / stats.total) * 100 : 0;
  stats.errorRate = stats.total > 0 ? (stats.error / stats.total) * 100 : 0;

  return stats;
};

const formatDate = (dateStr: string) => {
  const parts = dateStr.split('-');
  const day = parts[parts.length - 1];
  const month = parts[parts.length - 2];
  return `${parseInt(month)}월 ${parseInt(day)}일`;
};

const StatisticsSummary = ({ data }: { data: IfTbGateHist[] }) => {
  const stats = calculateStatistics(data);
  const { theme } = useSettingsStore();

  if (!stats)
    return (
      <Paper
        elevation={0}
        sx={{
          p: 5,
          mb: 2,
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: 2,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Typography variant='body2' sx={{ fontSize: '1.4rem' }}>
          데이터가 없습니다.
        </Typography>
      </Paper>
    );

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 2,
        border:
          theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
      }}
    >
      <Box sx={{ mb: 2 }}>
        <Typography variant='subtitle2' color='text.secondary' gutterBottom>
          게이트 작동 통계
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
          <Box
            sx={{
              p: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              borderRadius: 1,
              border:
                theme === 'dark'
                  ? '1px solid rgba(255, 255, 255, 0.1)'
                  : '1px solid rgba(0, 0, 0, 0.1)',
            }}
          >
            <Typography variant='subtitle2' color='text.secondary' gutterBottom>
              작동 현황 <span style={{ color: '#94a3b8' }}>( 총 작동: {stats.total}회 )</span>
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Typography variant='body2'>
                <span style={{ color: '#22c55e' }}>열림:</span> {stats.open}회
              </Typography>
              <Typography variant='body2'>
                <span style={{ color: '#ff5050' }}>닫힘:</span> {stats.close}회
              </Typography>
              <Typography variant='body2'>
                <span style={{ color: '#949393' }}>오류:</span> {stats.error}회
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
          <Box
            sx={{
              p: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              borderRadius: 1,
              border:
                theme === 'dark'
                  ? '1px solid rgba(255, 255, 255, 0.1)'
                  : '1px solid rgba(0, 0, 0, 0.1)',
            }}
          >
            <Typography variant='subtitle2' color='text.secondary' gutterBottom>
              작동 성공률
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Typography variant='body2'>성공률: {stats.successRate.toFixed(1)}%</Typography>
              <Typography variant='body2'>오류율: {stats.errorRate.toFixed(1)}%</Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
          <Box
            sx={{
              p: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              borderRadius: 1,
              border:
                theme === 'dark'
                  ? '1px solid rgba(255, 255, 255, 0.1)'
                  : '1px solid rgba(0, 0, 0, 0.1)',
            }}
          >
            <Typography variant='subtitle2' color='text.secondary' gutterBottom>
              일일 평균
            </Typography>
            <Typography variant='body2'>
              일일 평균 작동: {stats.avgDailyOperations.toFixed(1)}회
            </Typography>
          </Box>
        </Box>

        <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
          <Box
            sx={{
              p: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              borderRadius: 1,
              border:
                theme === 'dark'
                  ? '1px solid rgba(255, 255, 255, 0.1)'
                  : '1px solid rgba(0, 0, 0, 0.1)',
            }}
          >
            <Typography variant='subtitle2' color='text.secondary' gutterBottom>
              최대 작동일
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant='body2' sx={{ color: '#22c55e' }}>
                열림: {stats.maxOpenDay.date ? formatDate(stats.maxOpenDay.date) : '없음'} (
                {stats.maxOpenDay.count}회), 닫힘:{' '}
                {stats.maxCloseDay.date ? formatDate(stats.maxCloseDay.date) : '없음'} (
                {stats.maxCloseDay.count}회)
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

const Graph = ({
  date,
  list,
  showTooltips,
}: {
  gate: IfTbGate;
  date: string;
  list: IfTbGateHist[];
  showTooltips: boolean;
}) => {
  const { theme } = useSettingsStore();
  const { isMobile } = useMobile();
  const { chartRef, setOption } = useECharts();

  const calculateDailyOperationCounts = (data: IfTbGateHist[]) => {
    const dailyCounts = new Map<string, { open: number; close: number; error: number }>();

    data.forEach((item) => {
      if (!item.update_dt) return;

      const date = new Date(item.update_dt);
      const dayStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        '0'
      )}-${String(date.getDate()).padStart(2, '0')}`;

      if (!dailyCounts.has(dayStr)) {
        dailyCounts.set(dayStr, { open: 0, close: 0, error: 0 });
      }

      const counts = dailyCounts.get(dayStr)!;
      const stat = item.gate_stat as 'UpOk' | 'UpLock' | 'DownOk' | 'Stop' | 'Na' | undefined;
      if (!stat) return;

      if (stat === 'UpOk' || stat === 'UpLock') counts.open++;
      else if (stat === 'DownOk') counts.close++;
      else if (stat === 'Stop' || stat === 'Na') counts.error++;
    });

    return Array.from(dailyCounts.entries()).map(([date, counts]) => ({
      date,
      ...counts,
    }));
  };

  useEffect(() => {
    const dailyOperationCounts = calculateDailyOperationCounts(list);
    const [year, month] = date.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const xAxisData = Array.from({ length: daysInMonth }, (_, i) => `${i + 1}일`);

    const option: EChartsOption = {
      grid: {
        left: isMobile ? '40px' : '50px',
        top: isMobile ? '30px' : '40px',
        right: isMobile ? '20px' : '50px',
        bottom: isMobile ? '10px' : '20px',
        containLabel: true,
      },
      legend: {
        data: ['열림', '닫힘', '오류'],
        top: isMobile ? 5 : 10,
        right: isMobile ? 10 : 20,
        textStyle: {
          color: theme === 'dark' ? '#e2e8f0' : '#64748b',
          fontSize: isMobile ? 10 : 12,
        },
        itemWidth: isMobile ? 8 : 12,
        itemHeight: isMobile ? 8 : 12,
        itemGap: isMobile ? 12 : 20,
      },
      tooltip: showTooltips
        ? {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow',
              shadowStyle: {
                color: 'rgba(0, 0, 0, 0.1)',
              },
            },
            formatter: (params: any) => {
              const day = parseInt(params[0].name);
              const dayStr = `${year}-${month.toString().padStart(2, '0')}-${day
                .toString()
                .padStart(2, '0')}`;
              const dayCounts = dailyOperationCounts.find((d) => d.date === dayStr);

              if (!dayCounts) return '';

              const total = dayCounts.open + dayCounts.close + dayCounts.error;

              return `<div style="font-weight: bold; margin-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 4px;">
                      ${month.toString()}월 ${day}일</div>
                      <div style="margin-top: 8px;">
                        <div style="margin: 4px 0;">
                          <span style="display: inline-block; width: 8px; height: 8px; background: #22c55e; margin-right: 6px; border-radius: 2px;"></span>
                          <span style="color: #22c55e;">열림:</span> ${dayCounts.open}회
                        </div>
                        <div style="margin: 4px 0;">
                          <span style="display: inline-block; width: 8px; height: 8px; background: #ef4444; margin-right: 6px; border-radius: 2px;"></span>
                          <span style="color: #ef4444;">닫힘:</span> ${dayCounts.close}회
                        </div>
                        <div style="margin: 4px 0;">
                          <span style="display: inline-block; width: 8px; height: 8px; background: #6d6c6c; margin-right: 6px; border-radius: 2px;"></span>
                          <span style="color: #6d6c6c;">오류:</span> ${dayCounts.error}회
                        </div>
                        <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.1);">
                          <span style="color: #94a3b8;">총 작동: ${total}회</span>
                        </div>
                      </div>`;
            },
            backgroundColor: '#1E1E29',
            borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            borderWidth: 1,
            borderRadius: 4,
            textStyle: {
              color: '#dad8d8',
              fontSize: isMobile ? 11 : 13,
            },
            padding: isMobile ? [8, 12] : [12, 16],
            extraCssText: 'box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);',
          }
        : {},
      xAxis: {
        type: 'category',
        data: xAxisData,
        axisLabel: {
          color: theme === 'dark' ? '#a9a9a9' : '#64748b',
          fontSize: isMobile ? 10 : 12,
          margin: isMobile ? 8 : 12,
          fontWeight: 500,
          interval: isMobile ? 'auto' : 0,
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: theme === 'dark' ? 'rgba(226, 232, 240, 0.2)' : 'rgba(100, 116, 139, 0.2)',
            width: 1,
          },
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: theme === 'dark' ? 'rgba(226, 232, 240, 0.08)' : 'rgba(100, 116, 139, 0.08)',
            type: 'solid',
          },
        },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: '{value}회',
          fontSize: isMobile ? 10 : 12,
          color: theme === 'dark' ? '#a9a9a9' : '#64748b',
          margin: isMobile ? 12 : 16,
          fontWeight: 500,
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: theme === 'dark' ? 'rgba(226, 232, 240, 0.08)' : 'rgba(100, 116, 139, 0.08)',
            type: 'dashed',
          },
        },
        axisLine: {
          show: true,
          lineStyle: {
            color: theme === 'dark' ? 'rgba(226, 232, 240, 0.2)' : 'rgba(100, 116, 139, 0.2)',
            width: 1,
          },
        },
      },
      series: [
        {
          name: '열림',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: isMobile ? 4 : 6,
          data: xAxisData.map((_, index) => {
            const day = index + 1;
            const dayStr = `${year}-${month.toString().padStart(2, '0')}-${day
              .toString()
              .padStart(2, '0')}`;
            const dayCounts = dailyOperationCounts.find((d) => d.date === dayStr);
            return {
              value: dayCounts ? dayCounts.open : 0,
              itemStyle: { color: '#22c55e' },
            };
          }),
          lineStyle: {
            width: isMobile ? 1.5 : 2,
            color: '#22c55e',
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: '#22c55e',
              },
              {
                offset: 1,
                color: 'rgba(255, 255, 255, 0.1)',
              },
            ]),
            opacity: 0.2,
          },
          label: {
            show: !isMobile,
            position: 'top',
            formatter: (params: any) => {
              const value = params.value;
              return value > 0 ? `${value}회` : '';
            },
            fontSize: 11,
            color: '#ffffff',
            fontWeight: 500,
          },
        },
        {
          name: '닫힘',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: isMobile ? 4 : 6,
          data: xAxisData.map((_, index) => {
            const day = index + 1;
            const dayStr = `${year}-${month.toString().padStart(2, '0')}-${day
              .toString()
              .padStart(2, '0')}`;
            const dayCounts = dailyOperationCounts.find((d) => d.date === dayStr);
            return {
              value: dayCounts ? dayCounts.close : 0,
              itemStyle: { color: '#ef4444' },
            };
          }),
          lineStyle: {
            width: isMobile ? 1.5 : 2,
            color: '#ef4444',
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: '#ef4444',
              },
              {
                offset: 1,
                color: 'rgba(255, 255, 255, 0.1)',
              },
            ]),
            opacity: 0.2,
          },
          label: {
            show: !isMobile,
            position: 'top',
            formatter: (params: any) => {
              const value = params.value;
              return value > 0 ? `${value}회` : '';
            },
            fontSize: 11,
            color: '#ffffff',
            fontWeight: 500,
          },
        },
        {
          name: '오류',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: isMobile ? 4 : 6,
          data: xAxisData.map((_, index) => {
            const day = index + 1;
            const dayStr = `${year}-${month.toString().padStart(2, '0')}-${day
              .toString()
              .padStart(2, '0')}`;
            const dayCounts = dailyOperationCounts.find((d) => d.date === dayStr);
            return {
              value: dayCounts ? dayCounts.error : 0,
              itemStyle: { color: '#6d6c6c' },
            };
          }),
          lineStyle: {
            width: isMobile ? 1.5 : 2,
            color: '#6d6c6c',
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: '#6d6c6c',
              },
              {
                offset: 1,
                color: 'rgba(255, 255, 255, 0.1)',
              },
            ]),
            opacity: 0.2,
          },
          label: {
            show: !isMobile,
            position: 'top',
            formatter: (params: any) => {
              const value = params.value;
              return value > 0 ? `${value}회` : '';
            },
            fontSize: 11,
            color: '#ffffff',
            fontWeight: 500,
          },
        },
      ],
    };

    setOption(option);
  }, [list, showTooltips, theme, date, isMobile, setOption]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div
        ref={chartRef}
        style={{ width: '100%', height: '100%', position: 'absolute', zIndex: 2 }}
      ></div>
    </div>
  );
};

export const ChartGateStatsMonth = (props: Props) => {
  const { data: list } = useSWR<IfTbGateHist[]>(
    props.gate.gate_seq
      ? ['/api/gate_hist/listmonth', { gateSeq: props.gate.gate_seq, yearMonth: props.date }]
      : null
  );

  return (
    <Box>
      <StatisticsSummary data={list || []} />
      <div style={{ width: '100%', height: '320px', position: 'relative', touchAction: 'none' }}>
        <Graph list={list || []} gate={props.gate} date={props.date} showTooltips={true} />
      </div>
    </Box>
  );
};
