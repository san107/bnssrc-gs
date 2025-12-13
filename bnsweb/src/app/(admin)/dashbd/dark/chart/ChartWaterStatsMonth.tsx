// @flow
import { IfTbWater } from '@/models/water/tb_water';
import { IfTbWaterHist } from '@/models/water/tb_water_hist';
import { Box, Paper, Typography, FormGroup, FormControlLabel, Checkbox } from '@mui/material';
import * as echarts from 'echarts';
import * as React from 'react';
import { useEffect } from 'react';
import useSWR from 'swr';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useWaterLevelRefresh } from '@/hooks/useWaterLevelRefresh';
import { useECharts } from '@/hooks/useECharts';
import { useMobile } from '@/hooks/useMobile';

type Props = {
  water: IfTbWater;
  date: string;
};

type EChartsOption = echarts.EChartsOption;

const calculateDailyStageCounts = (data: IfTbWaterHist[], water: IfTbWater) => {
  const dailyCounts = new Map<
    string,
    { safe: number; attention: number; warning: number; critical: number; danger: number }
  >();

  data.forEach((item) => {
    if (!item.water_dt || item.water_level === undefined) return;

    const date = new Date(item.water_dt);
    const dayStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
      date.getDate()
    ).padStart(2, '0')}`;
    const level = item.water_level;
    const limitAttn = water.limit_attn ?? 0;
    const limitWarn = water.limit_warn ?? 0;
    const limitAlert = water.limit_alert ?? 0;
    const limitCrit = water.limit_crit ?? 0;

    if (!dailyCounts.has(dayStr)) {
      dailyCounts.set(dayStr, { safe: 0, attention: 0, warning: 0, critical: 0, danger: 0 });
    }

    const counts = dailyCounts.get(dayStr)!;
    if (level >= limitCrit) counts.danger++;
    else if (level >= limitAlert) counts.critical++;
    else if (level >= limitWarn) counts.warning++;
    else if (level >= limitAttn) counts.attention++;
    else counts.safe++;
  });

  return Array.from(dailyCounts.entries()).map(([date, counts]) => ({
    date,
    ...counts,
  }));
};

const calculateStatistics = (data: IfTbWaterHist[], water: IfTbWater) => {
  if (!data.length) return null;

  const levels = data.map((item) => item.water_level).filter((level) => level !== undefined);
  const totalCount = levels.length;

  const stageCounts = {
    safe: 0,
    attention: 0,
    warning: 0,
    critical: 0,
    danger: 0,
  };

  data.forEach((item) => {
    if (item.water_level === undefined) return;
    const level = item.water_level;
    const limitAttn = water.limit_attn ?? 0;
    const limitWarn = water.limit_warn ?? 0;
    const limitAlert = water.limit_alert ?? 0;
    const limitCrit = water.limit_crit ?? 0;

    if (level >= limitCrit) stageCounts.danger++;
    else if (level >= limitAlert) stageCounts.critical++;
    else if (level >= limitWarn) stageCounts.warning++;
    else if (level >= limitAttn) stageCounts.attention++;
    else stageCounts.safe++;
  });

  return {
    averageLevel: levels.reduce((a, b) => a + b, 0) / totalCount,
    maxLevel: Math.max(...levels),
    minLevel: Math.min(...levels),
    stageCounts,
    totalCount,
  };
};

const StatisticsSummary = ({
  data,
  water,
  selectedStages,
  onStageChange,
}: {
  data: IfTbWaterHist[];
  water: IfTbWater;
  selectedStages: { [key: string]: boolean };
  onStageChange: (stage: string) => (event: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  const { theme } = useSettingsStore();
  const stageConfig = {
    safe: { name: '안전', color: '#22c55e' },
    attention: { name: '관심', color: '#3b82f6' },
    warning: { name: '주의', color: '#f59e0b' },
    critical: { name: '경계', color: '#f97316' },
    danger: { name: '심각', color: '#ef4444' },
  };

  const stats = calculateStatistics(data, water);

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
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 33%' } }}>
          <Typography variant='subtitle2' color='text.secondary' gutterBottom>
            수위 통계
          </Typography>
          <Typography variant='body2' sx={{ fontSize: '1.4rem' }}>
            평균: {stats.averageLevel.toFixed(2)}m
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Typography variant='body2'>최고: {stats.maxLevel.toFixed(2)}m</Typography>
            <Typography variant='body2'>최저: {stats.minLevel.toFixed(2)}m</Typography>
          </Box>
        </Box>
        <Box sx={{ flex: { xs: '1 1 100%', md: '2 1 67%' } }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant='subtitle2' color='text.secondary' gutterBottom>
                단계별 필터
              </Typography>
              <FormGroup row sx={{ gap: 2 }}>
                {Object.entries(stageConfig).map(([stage, config]) => (
                  <FormControlLabel
                    key={stage}
                    control={
                      <Checkbox
                        checked={selectedStages[stage]}
                        onChange={onStageChange(stage)}
                        sx={{
                          color: config.color,
                          '&.Mui-checked': {
                            color: config.color,
                          },
                        }}
                      />
                    }
                    label={
                      <Typography
                        variant='body2'
                        sx={{
                          color: '#e2e8f0',
                          fontWeight: 500,
                        }}
                      >
                        {config.name}
                      </Typography>
                    }
                  />
                ))}
              </FormGroup>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(2, 1fr)' },
                  gap: 1,
                }}
              >
                {Object.entries(stats.stageCounts).map(([stage, count]) => (
                  <Box key={stage} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: stageConfig[stage as keyof typeof stageConfig].color,
                      }}
                    />
                    <Typography variant='body2'>
                      {stageConfig[stage as keyof typeof stageConfig].name}: {count}회 (
                      {((count / stats.totalCount) * 100).toFixed(1)}%)
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

const Graph = ({
  water,
  date,
  list,
  showTooltips,
  selectedStages,
}: {
  water: IfTbWater;
  date: string;
  list: IfTbWaterHist[];
  showTooltips: boolean;
  selectedStages: { [key: string]: boolean };
}) => {
  const { theme } = useSettingsStore();
  const { chartRef, setOption } = useECharts();
  const { isMobile } = useMobile();

  React.useEffect(() => {
    const dailyStageCounts = calculateDailyStageCounts(list, water);
    const [year, month] = date.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const xAxisData = Array.from({ length: daysInMonth }, (_, i) => `${i + 1}일`);

    const stageConfig = {
      safe: { name: '안전', color: '#22c55e' },
      attention: { name: '관심', color: '#3b82f6' },
      warning: { name: '주의', color: '#f59e0b' },
      critical: { name: '경계', color: '#f97316' },
      danger: { name: '심각', color: '#ef4444' },
    };

    const generateSeriesData = (
      stage: 'safe' | 'attention' | 'warning' | 'critical' | 'danger',
      config: { name: string; color: string }
    ): echarts.LineSeriesOption => {
      return {
        name: config.name,
        type: 'line',
        stack: 'total',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        sampling: 'average',
        areaStyle: {
          opacity: 0.7,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: config.color },
            { offset: 1, color: echarts.color.lift(config.color, 0.2) },
          ]),
        },
        lineStyle: {
          width: 2,
          color: config.color,
        },
        emphasis: {
          focus: 'series',
          itemStyle: {
            borderWidth: 2,
            borderColor: '#fff',
            shadowColor: 'rgba(0, 0, 0, 0.5)',
            shadowBlur: 10,
          },
        },
        data: xAxisData.map((_, index) => {
          const day = index + 1;
          const dayStr = `${year}-${month.toString().padStart(2, '0')}-${day
            .toString()
            .padStart(2, '0')}`;
          const dayCounts = dailyStageCounts.find((d) => d.date === dayStr);
          const total = dayCounts
            ? dayCounts.safe +
              dayCounts.attention +
              dayCounts.warning +
              dayCounts.critical +
              dayCounts.danger
            : 0;
          return {
            value: dayCounts ? (dayCounts[stage] / total) * 100 : 0,
            itemStyle: { color: config.color },
            emphasis: {
              itemStyle: {
                color: config.color,
              },
            },
          };
        }),
        label: {
          show: true,
          position: 'top',
          formatter: (params: any) => {
            const value = params.value;
            return value > 5 ? `${value.toFixed(1)}%` : '';
          },
          fontSize: 11,
          color: '#ffffff',
          fontWeight: 500,
          backgroundColor: 'rgba(0,0,0,0.3)',
          padding: [2, 4],
          borderRadius: 2,
        },
      };
    };

    const option: EChartsOption = {
      grid: {
        left: isMobile ? '40px' : '50px',
        top: isMobile ? '30px' : '40px',
        right: isMobile ? '20px' : '50px',
        bottom: isMobile ? '10px' : '20px',
        containLabel: true,
      },
      legend: {
        data: Object.entries(stageConfig)
          .filter(([key]) => selectedStages[key])
          .map(([_, config]) => config.name),
        top: 0,
        right: '4%',
        textStyle: {
          color: theme === 'dark' ? '#e2e8f0' : '#64748b',
          fontSize: 11,
        },
        itemWidth: 10,
        itemHeight: 10,
        itemGap: 15,
        selectedMode: true,
        emphasis: {
          selectorLabel: {
            show: true,
          },
        },
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
              const dayCounts = dailyStageCounts.find((d) => d.date === dayStr);

              if (!dayCounts) return '';

              const total =
                dayCounts.safe +
                dayCounts.attention +
                dayCounts.warning +
                dayCounts.critical +
                dayCounts.danger;

              return `<div style="font-weight: bold; margin-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 4px;">
                      ${month.toString()}월 ${day}일</div>
                      <div style="margin-top: 8px;">
                        ${Object.entries(stageConfig)
                          .map(([stage, config]) => {
                            const count = dayCounts[stage as keyof typeof dayCounts] as number;
                            const percent = ((count / total) * 100).toFixed(1);
                            return `
                        <div style="margin: 4px 0;">
                          <span style="display: inline-block; width: 8px; height: 8px; background: ${config.color}; margin-right: 6px; border-radius: 2px;"></span>
                          <span style="color: ${config.color};">${config.name}:</span> ${count}회 (${percent}%)
                        </div>`;
                          })
                          .join('')}
                        <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.1);">
                          <span style="color: #94a3b8;">총 측정: ${total}회</span>
                        </div>
                      </div>`;
            },
            backgroundColor: '#1E1E29',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            borderRadius: 4,
            textStyle: {
              color: '#dad8d8',
              fontSize: 12,
            },
            padding: [8, 12],
            extraCssText: 'box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);',
          }
        : {},
      xAxis: {
        type: 'category',
        data: xAxisData,
        axisLabel: {
          color: theme === 'dark' ? '#a9a9a9' : '#64748b',
          fontSize: 11,
          margin: 8,
          fontWeight: 500,
          interval: 0,
          rotate: 30,
          hideOverlap: true,
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
        axisTick: {
          alignWithLabel: true,
        },
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 100,
        axisLabel: {
          formatter: '{value}%',
          fontSize: 11,
          color: theme === 'dark' ? '#a9a9a9' : '#64748b',
          margin: 12,
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
        splitNumber: 5,
      },
      series: Object.entries(stageConfig)
        .filter(([key]) => selectedStages[key])
        .map(([stage, config]) => generateSeriesData(stage as any, config)),
    };

    setOption(option);
  }, [list, showTooltips, theme, date, water, selectedStages, setOption, isMobile]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div
        ref={chartRef}
        style={{ width: '100%', height: '100%', position: 'absolute', zIndex: 2 }}
      ></div>
    </div>
  );
};

export const ChartWaterStatsMonth = (props: Props) => {
  const { data: list, mutate: mutateWaterHist } = useSWR<IfTbWaterHist[]>(
    props.water.water_dev_id && [
      '/api/water_hist/listmonth',
      {
        waterDevId: props.water.water_dev_id,
        yearMonth: props.date,
      },
    ]
  );

  const { refreshTrigger } = useWaterLevelRefresh();
  const [selectedStages, setSelectedStages] = React.useState({
    safe: true,
    attention: true,
    warning: true,
    critical: true,
    danger: true,
  });

  useEffect(() => {
    mutateWaterHist();
  }, [refreshTrigger, mutateWaterHist]);

  const handleStageChange = (stage: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedStages((prev) => ({
      ...prev,
      [stage]: event.target.checked,
    }));
  };

  return (
    <Box>
      <StatisticsSummary
        data={list || []}
        water={props.water}
        selectedStages={selectedStages}
        onStageChange={handleStageChange}
      />
      <div style={{ width: '100%', height: '320px', position: 'relative' }}>
        <Graph
          list={list || []}
          water={props.water}
          date={props.date}
          showTooltips={true}
          selectedStages={selectedStages}
        />
      </div>
    </Box>
  );
};
