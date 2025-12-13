import React from 'react';
import * as weatherutils from '@/utils/weather-utils';
import { Box, Card, CardContent, Chip, Typography, styled, alpha } from '@mui/material';
import PlaceIcon from '@mui/icons-material/Place';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import { IfTbWeather } from '@/models/tb_weather';
import { IfWeather } from '@/models/weather';

type Props = {
  region: IfTbWeather;
  weatherData?: {
    pops: IfWeather[];
    resultMsg?: string;
    timestamp: number;
  };
  onSelect: (data: any, resultMsg?: string) => void;
  onFetchData?: () => void;
};

const CardSlideWeather = styled(Card)(({ theme }) => ({
  background: `rgba(255, 255, 255, 0.1)`,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  borderRadius: '16px',
  cursor: 'pointer',
  transition: 'all 0.3s ease-in-out',
  boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.1)}`,
  position: 'relative',
  overflow: 'hidden',

  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  },

  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 8px 30px ${alpha(theme.palette.common.black, 0.15)}`,
    borderColor: alpha(theme.palette.primary.main, 0.4),
  },
}));

const WeatherValue = styled(Typography)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontWeight: 600,
  color: theme.palette.text.primary,
  marginBottom: '4px',
}));

const WeatherLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  color: theme.palette.text.secondary,
  fontWeight: 500,
}));

const styles = {
  cardContent: {
    p: 2,
  },
  titleContainer: {
    mb: 1.5,
    display: 'flex',
    justifyContent: 'center',
  },
  chip: {
    fontWeight: 600,
    fontSize: '0.9rem',
    px: 1.5,
    py: 0.5,
    background: `linear-gradient(45deg, ${alpha('#3f51b5', 0.9)}, ${alpha('#2196f3', 0.9)})`,
    color: 'white',
    '& .MuiChip-icon': {
      color: 'white',
    },
  },
  weatherContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
  },
  weatherBox: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    p: 1.5,
    borderRadius: '8px',
  },
  itemBox: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    px: 1,
  },
  icon: {
    fontSize: '1rem',
  },
  yesterdayIcon: {
    color: '#1976d2',
    fontSize: '1rem',
  },
  todayIcon: {
    color: '#4caf50',
    fontSize: '1rem',
  },
  currentIcon: {
    color: '#ff9800',
    fontSize: '1rem',
  },
};

const ItemWeatherCard = ({ region, weatherData, onSelect }: Props) => {
  const renderWeatherContent = () => {
    if (
      weatherData &&
      weatherData.pops &&
      weatherData.resultMsg !== 'ERROR' &&
      weatherData.resultMsg !== 'NO_DATA'
    ) {
      // 현재 강수확률 계산
      const currentPop =
        weatherData?.pops?.find(
          (pop) =>
            pop.fcstDate === weatherutils.getToday()?.date &&
            pop.fcstTime === weatherutils.getToday()?.time
        )?.fcstValue || '0.0';

      return (
        <Box sx={styles.weatherContainer}>
          <Box sx={styles.itemBox}>
            <WeatherLabel>전일강우</WeatherLabel>
            <WeatherValue>
              <WaterDropIcon sx={styles.yesterdayIcon} />
              {weatherData.pops ? weatherutils.getYesterdayPopRate(weatherData.pops) : '0.0'}%
            </WeatherValue>
          </Box>
          <Box sx={styles.itemBox}>
            <WeatherLabel>금일강우</WeatherLabel>
            <WeatherValue>
              <WaterDropIcon sx={styles.todayIcon} />
              {weatherData.pops ? weatherutils.getTodayPopRate(weatherData.pops) : '0.0'}%
            </WeatherValue>
          </Box>
          <Box sx={styles.itemBox}>
            <WeatherLabel>현재시간</WeatherLabel>
            <WeatherValue>
              <WaterDropIcon sx={styles.currentIcon} />
              {Number(currentPop).toFixed(1)}%
            </WeatherValue>
          </Box>
        </Box>
      );
    }
  };

  return (
    <CardSlideWeather onClick={() => onSelect(weatherData?.pops, weatherData?.resultMsg)}>
      <CardContent sx={styles.cardContent}>
        <Box sx={styles.titleContainer}>
          <Chip label={region.wt_rgn_nm} color='primary' icon={<PlaceIcon />} sx={styles.chip} />
        </Box>
        {renderWeatherContent()}
      </CardContent>
    </CardSlideWeather>
  );
};

export default ItemWeatherCard;
