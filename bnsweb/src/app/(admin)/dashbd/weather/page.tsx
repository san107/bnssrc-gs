'use client';

import { useState, useEffect } from 'react';
import { Box, Grid, Typography, Paper, styled, CircularProgress } from '@mui/material';
import ChartWeather from '@/app/(admin)/dashbd/weather/ChartWeather';
import ItemWeatherCard from '@/app/(admin)/dashbd/weather/ItemWeatherCard';
import ItemWeatherTable from '@/app/(admin)/dashbd/weather/ItemWeatherTable';
import { IfTbWeather } from '@/models/tb_weather';
import { IfWeather } from '@/models/weather';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import { RainyEffect } from '@/app/(admin)/dashbd/weather/effect/RainyEffect';
import useSWR from 'swr';
import useWeatherMulti from '@/hooks/useWeatherMulti';
import InfoIcon from '@mui/icons-material/Info';
import CachedIcon from '@mui/icons-material/Cached';
import RefreshIcon from '@mui/icons-material/Refresh';

import 'swiper/css';
import { ProtectedComponent } from '@/abilities/abilities';
import { useWeatherResionStore } from '@/hooks/useWeatherResion';

const commonStyles = {
  flexCenter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flexBetween: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
  },
  glassEffect: {
    background: 'rgba(255,255,255,0.25)',
    backdropFilter: 'blur(8px)',
    borderRadius: '16px',
  },
};

const WeatherContainer = styled(Box)({
  // background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 50%, #01579b 100%)',
  // background: 'linear-gradient(90deg, #365ea3 0%, #0d47a1 50%, #01579b 100%)',
  background: 'linear-gradient(90deg, #151c6e 0%, #0d47a1 50%, #01579b 100%)',
  minHeight: '100vh',
  padding: '1.5rem',
  position: 'relative',
  overflow: 'auto',
  height: '100vh',
});

const StyledPaper = styled(Paper)({
  background: 'rgba(255, 255, 255, 0.9) !important',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
  border: '1px solid rgba(255,255,255,0.2)',
});

const WeatherTable = styled('table')({
  width: '100%',
  borderCollapse: 'separate',
  fontSize: '14px',
  borderSpacing: 0,
  '& tr:hover, & tr:nth-of-type(even):hover': {
    backgroundColor: '#bdd7ff',
    cursor: 'pointer',
  },
  '& tr:nth-of-type(even)': {
    backgroundColor: '#eff7fd',
  },
  '& th': {
    paddingTop: '14px',
    paddingBottom: '14px',
    textAlign: 'center',
    color: '#64748b',
    fontWeight: 600,
    fontSize: '16px',
    borderBottom: '2px solid #e2e8f0',
    background: 'linear-gradient(to bottom, #f8fafc 0%, #f1f5f9 100%)',
  },
  '& td': {
    padding: '8px',
    textAlign: 'center',
    fontSize: '14px',
  },
});

const ShineAnimation = styled(Box)({
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at top right, rgba(255,255,255,0.3) 0%, transparent 60%)',
    animation: 'shine 3s infinite',
  },
  '@keyframes shine': {
    '0%': {
      opacity: 0.5,
      transform: 'translateX(-100%) translateY(-100%)',
    },
    '50%': {
      opacity: 0.8,
    },
    '100%': {
      opacity: 0.5,
      transform: 'translateX(100%) translateY(100%)',
    },
  },
});

const WeatherDataNotice = styled(Box)({
  marginBottom: '16px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  flexWrap: 'wrap',
});

const NoticeIcon = styled(Box)({
  width: '24px',
  height: '24px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  fontSize: '12px',
  fontWeight: 'bold',
});

const NoticeText = styled(Typography)({
  color: '#fff',
  fontWeight: 500,
  fontSize: '14px',
});

const LoadingContent = styled(Box)({
  textAlign: 'center',
  color: 'white',
  padding: '4rem 2rem',
  background: 'rgba(255, 255, 255, 0.1)',
  borderRadius: '16px',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  height: '95%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
});

const LoadingSpinner = styled(CircularProgress)({
  color: 'white',
  marginBottom: '16px',
});

const ErrorContent = styled(Box)({
  textAlign: 'center',
  padding: '4rem 2rem',
  background: 'rgba(255, 255, 255, 0.1)',
  borderRadius: '16px',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  height: '95%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
});

const CacheStatusBox = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 12px',
  background: 'rgba(255, 255, 255, 0.15)',
  borderRadius: '8px',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  fontSize: '12px',
  color: '#fff',
});

const RefreshButton = styled('button')({
  background: 'rgba(255, 255, 255, 0.2)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  borderRadius: '6px',
  padding: '6px 10px',
  color: '#fff',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  fontSize: '12px',
  transition: 'all 0.2s ease',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.3)',
    transform: 'translateY(-1px)',
  },
  '&:active': {
    transform: 'translateY(0)',
  },
});

const IndexWeather = () => {
  const { data: list, error: listError } = useSWR<IfTbWeather[]>(['/api/weather/list']);
  const [selName, setSelName] = useState<string>('');
  const [selData, setSelData] = useState<IfWeather[]>([]);
  const [selResultMsg, setSelResultMsg] = useState<string | undefined>(undefined);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const { fetchAllWeatherData, getWeatherData, isLoading, clearCache, getCacheStatus } =
    useWeatherMulti();
  const [cacheStatus, setCacheStatus] = useState<any>(null);

  // 캐시 상태 업데이트
  useEffect(() => {
    if (!isLoading) {
      setCacheStatus(getCacheStatus());
    }
  }, [isLoading, getCacheStatus]);

  useEffect(() => {
    if (list && list.length > 0) {
      setIsInitialLoading(true);
      setWeatherError(null);

      // 모든 지역의 날씨 데이터를 한번에 가져오기
      fetchAllWeatherData(list)
        .then(() => {
          console.log('API 호출 완료');
          setIsInitialLoading(false);
        })
        .catch((error) => {
          console.log('API 호출 실패:', error);
          setWeatherError('날씨 데이터를 불러오는 중 오류가 발생했습니다.');
          setIsInitialLoading(false);
        });
    }
  }, [list, fetchAllWeatherData]);

  // 첫 번째 지역을 기본 선택
  useEffect(() => {
    if (list && list.length > 0 && selData.length === 0 && !isInitialLoading && !weatherError) {
      const firstRegion = list[0];
      const weatherData = getWeatherData(firstRegion);

      if (weatherData) {
        handleSelect(weatherData.pops, firstRegion.wt_rgn_nm || '', weatherData.resultMsg);
      }
    }
  }, [list, selData.length, getWeatherData, isInitialLoading, weatherError]);

  const handleSelect = (data: IfWeather[], name: string, resultMsg?: string) => {
    setSelData(data);
    setSelName(name);
    setSelResultMsg(resultMsg);
  };

  const slideCount = list?.length || 0;
  const getSlidesPerView = () => {
    if (slideCount >= 5) return 5;
    if (slideCount >= 3) return 3;
    if (slideCount >= 2) return 2;
    return 1;
  };

  const handleRefresh = async () => {
    if (list && list.length > 0) {
      setIsInitialLoading(true);
      setWeatherError(null);

      try {
        await fetchAllWeatherData(list);
        console.log('데이터 새로고침 완료');
        setIsInitialLoading(false);
      } catch (error) {
        console.log('데이터 새로고침 실패:', error);
        setWeatherError('날씨 데이터를 새로고침하는 중 오류가 발생했습니다.');
        setIsInitialLoading(false);
      }
    }
  };

  const handleClearCache = () => {
    clearCache();
    setCacheStatus(getCacheStatus());
  };

  const { currentRegionName } = useWeatherResionStore();

  return (
    <ProtectedComponent action='view' subject='dashbd'>
      <WeatherContainer>
        <WeatherDataNotice>
          <NoticeIcon>
            <InfoIcon />
          </NoticeIcon>
          <NoticeText>
            이 데이터는 기상청의 공공데이터(단기예보)를 활용하고 있습니다. (전일자 11시 기준으로
            제공됩니다.)
          </NoticeText>

          {/* 캐시 상태 표시 */}
          {cacheStatus && (
            <CacheStatusBox>
              <CachedIcon sx={{ fontSize: '16px' }} />
              <span>
                캐시: {cacheStatus.validEntries}/{cacheStatus.totalEntries} 지역
              </span>
              {cacheStatus.expiredEntries > 0 && (
                <span style={{ opacity: 0.7 }}>({cacheStatus.expiredEntries}개 만료)</span>
              )}
            </CacheStatusBox>
          )}

          {/* 새로고침 버튼 */}
          <RefreshButton onClick={handleRefresh} disabled={isLoading}>
            <RefreshIcon sx={{ fontSize: '14px' }} />
            새로고침
          </RefreshButton>

          {/* 캐시 삭제 버튼 */}
          <RefreshButton onClick={handleClearCache} disabled={isLoading}>
            <CachedIcon sx={{ fontSize: '14px' }} />
            캐시 삭제
          </RefreshButton>
        </WeatherDataNotice>

        {/* 로딩 상태 */}
        {(isInitialLoading || isLoading) && (
          <LoadingContent>
            <LoadingSpinner size={60} />
            <Typography variant='h5' fontWeight='600' sx={{ mb: 1 }}>
              {isInitialLoading ? '날씨 데이터를 불러오는 중...' : '데이터를 업데이트하는 중...'}
              {isInitialLoading && currentRegionName && '(' + currentRegionName + ')'}
            </Typography>
            <Typography variant='body1' sx={{ opacity: 0.8 }}>
              {isInitialLoading ? '잠시만 기다려주세요' : '캐시된 데이터를 확인하고 있습니다'}
            </Typography>
          </LoadingContent>
        )}

        {/* 에러 상태 */}
        {(listError || weatherError) && (
          <ErrorContent>
            <Typography variant='h6' color='white' sx={{ mb: 1 }}>
              오류가 발생했습니다.
            </Typography>
            <Typography variant='body1' color='white' sx={{ opacity: 0.8 }}>
              페이지를 새로고침하거나 잠시 후 다시 시도해주세요.
            </Typography>
          </ErrorContent>
        )}

        {/* 데이터 표시 */}
        {!isInitialLoading && !listError && !weatherError && list && list.length > 0 && (
          <>
            <Grid container spacing={2} columns={{ xs: 1, md: 12, lg: 12 }}>
              <Grid size={{ xs: 12, md: 8, lg: 8 }}>
                <StyledPaper
                  elevation={0}
                  sx={{
                    p: 2,
                    height: '100%',
                    minHeight: '400px',
                    borderRadius: 4,
                  }}
                >
                  <ChartWeather data={selData} name={selName} resultMsg={selResultMsg} />
                </StyledPaper>
              </Grid>
              <Grid size={{ xs: 12, md: 4, lg: 4 }}>
                <StyledPaper
                  elevation={0}
                  sx={{
                    borderRadius: 4,
                    overflow: 'hidden',
                    height: '100%',
                    minHeight: '400px',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      p: 2,
                      background: 'linear-gradient(135deg, #005FFA 0%, #0047CC 100%)',
                      color: '#fff',
                      alignItems: 'center',
                      borderRadius: '16px 16px 0 0',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <ShineAnimation>
                      <Box
                        sx={{
                          ...commonStyles.flexBetween,
                          position: 'relative',
                          zIndex: 1,
                        }}
                      >
                        <Box
                          sx={{
                            width: 56,
                            height: 56,
                            ...commonStyles.flexCenter,
                            ...commonStyles.glassEffect,
                            '& img': {
                              width: '36px',
                              height: '36px',
                              filter:
                                'brightness(0) invert(1) drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                            },
                          }}
                        >
                          <img src='/images/w-umbrella.png' width={36} height={36} alt='강우량' />
                        </Box>
                        <Typography
                          variant='h5'
                          fontWeight='600'
                          sx={{
                            letterSpacing: '-0.5px',
                            textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                          }}
                        >
                          강우량 데이터
                        </Typography>
                      </Box>
                    </ShineAnimation>
                    <RainyEffect />
                  </Box>
                  <Box sx={{ p: 2 }}>
                    <Box
                      sx={{
                        maxHeight: '450px',
                        overflowY: 'auto',
                        '& thead': {
                          position: 'sticky',
                          top: 0,
                          backgroundColor: '#f8fafc',
                          zIndex: 1,
                        },
                      }}
                    >
                      <WeatherTable>
                        <thead>
                          <tr>
                            <th>지역명</th>
                            <th>전일강우</th>
                            <th>금일강우</th>
                            <th>현재시간</th>
                          </tr>
                        </thead>
                        <tbody>
                          {list && list.length > 0 ? (
                            list.map((region) => (
                              <ItemWeatherTable
                                key={region.wt_seq}
                                region={region}
                                weatherData={getWeatherData(region)}
                                onSelect={(data, resultMsg) =>
                                  handleSelect(data, region?.wt_rgn_nm || '', resultMsg)
                                }
                              />
                            ))
                          ) : (
                            <tr>
                              <td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>
                                날씨지역 데이터가 없습니다.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </WeatherTable>
                    </Box>
                  </Box>
                </StyledPaper>
              </Grid>
            </Grid>

            <Box sx={{ mt: 2 }}>
              <StyledPaper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 4,
                }}
              >
                <Swiper
                  slidesPerView={getSlidesPerView()}
                  spaceBetween={16}
                  navigation={false}
                  mousewheel={true}
                  autoplay={{
                    delay: 3000,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                  }}
                  modules={[Navigation, Autoplay]}
                  loop={list?.length > 0}
                  breakpoints={{
                    320: { slidesPerView: 1 },
                    600: { slidesPerView: 2 },
                    900: { slidesPerView: 3 },
                    1200: { slidesPerView: 5 },
                  }}
                  style={{
                    padding: '0.75rem',
                  }}
                >
                  {list && list.length > 0 ? (
                    (list || []).map((region) => (
                      <SwiperSlide key={region?.wt_seq}>
                        <ItemWeatherCard
                          region={region}
                          weatherData={getWeatherData(region)}
                          onSelect={(data, resultMsg) =>
                            handleSelect(data, region?.wt_rgn_nm || '', resultMsg)
                          }
                        />
                      </SwiperSlide>
                    ))
                  ) : (
                    <Box sx={{ width: '100%', textAlign: 'center' }}>
                      날씨지역 데이터가 없습니다.
                    </Box>
                  )}
                </Swiper>
              </StyledPaper>
            </Box>
          </>
        )}

        {/* 데이터가 없는 경우 */}
        {!isInitialLoading && !listError && !weatherError && (!list || list.length === 0) && (
          <ErrorContent>
            <Typography variant='h6' color='white' sx={{ mb: 1 }}>
              날씨 지역 데이터가 없습니다
            </Typography>
            <Typography variant='body1' color='white' sx={{ opacity: 0.8 }}>
              관리자에게 문의하여 지역 데이터를 추가해주세요.
            </Typography>
          </ErrorContent>
        )}
      </WeatherContainer>
    </ProtectedComponent>
  );
};

export default IndexWeather;
