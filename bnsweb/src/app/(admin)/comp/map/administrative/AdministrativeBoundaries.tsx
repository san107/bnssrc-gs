import { mapStore } from '@/store/mapStore';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  CircularProgress,
  Chip,
} from '@mui/material';
import GeoJSON from 'ol/format/GeoJSON.js';
import { Vector as VectorLayer } from 'ol/layer.js';
import { Fill, Stroke, Style } from 'ol/style.js';
import VectorSource from 'ol/source/Vector.js';
import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  ADMINISTRATIVE_REGIONS,
  getBoundaryCache,
  clearBoundaryCache,
  getBoundaryCacheStatus,
  AdministrativeRegion,
  SEOUL_DISTRICTS,
  GYEONGGI_DISTRICTS,
} from '@/utils/administrative-utils';

type Props = { open?: boolean };

export const AdministrativeBoundaries = ({ open }: Props) => {
  const { map } = mapStore();
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [regions, setRegions] = useState<AdministrativeRegion[]>([]);
  const [boundaryLayer, setBoundaryLayer] = useState<VectorLayer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cacheStatus, setCacheStatus] = useState<{ size: number; keys: string[] }>({
    size: 0,
    keys: [],
  });

  const removeBoundary = useCallback(() => {
    if (map && boundaryLayer) {
      map.removeLayer(boundaryLayer);
      setBoundaryLayer(null);
    }
  }, [map, boundaryLayer]);

  useEffect(() => {
    setRegions(ADMINISTRATIVE_REGIONS);
    updateCacheStatus();
  }, []);

  useEffect(() => {
    if (!open && boundaryLayer) {
      removeBoundary();
    }
  }, [open, boundaryLayer, removeBoundary]);

  const updateCacheStatus = () => {
    const status = getBoundaryCacheStatus();
    setCacheStatus(status);
  };

  const loadBoundary = async (regionCode: string) => {
    if (!map) return;

    setIsLoading(true);
    try {
      if (boundaryLayer) {
        map.removeLayer(boundaryLayer); // 기존 경계 레이어 제거
      }

      // 캐시된 행정구역 경계 데이터 가져오기
      const boundaryData = await getBoundaryCache(regionCode);

      if (boundaryData) {
        // WGS84 데이터를 직접 사용 (좌표계 변환 불필요)
        const format = new GeoJSON({ featureProjection: 'EPSG:3857' });

        // boundaryData가 Feature인지 FeatureCollection인지 확인
        let olFeatures;
        if (boundaryData.type === 'Feature') {
          olFeatures = format.readFeatures({
            type: 'FeatureCollection',
            features: [boundaryData],
          });
        } else if (boundaryData.type === 'FeatureCollection') {
          olFeatures = format.readFeatures(boundaryData);
        } else {
          // 단일 Feature로 처리리
          olFeatures = format.readFeatures({
            type: 'FeatureCollection',
            features: [boundaryData],
          });
        }

        // 변환된 feature가 비어있는지 확인
        if (olFeatures.length === 0) {
          toast.error('경계 데이터가 유효하지 않습니다.');
          return;
        }

        const source = new VectorSource({ features: olFeatures });
        const layer = new VectorLayer({
          source: source,
          style: new Style({
            fill: new Fill({
              color: 'rgba(0, 119, 255, 0.1)',
            }),
            stroke: new Stroke({
              color: 'rgb(0, 119, 255)',
              width: 2,
            }),
          }),
          zIndex: 1,
        });

        map.addLayer(layer);
        setBoundaryLayer(layer);

        // 경계에 맞춰 지도 뷰 조정
        const geometry = olFeatures[0]?.getGeometry();
        if (geometry) {
          const extent = geometry.getExtent();
          // extent가 유효한지 확인 (minX < maxX, minY < maxY)
          if (extent[0] < extent[2] && extent[1] < extent[3]) {
            // 지역별 적절한 zoom level 설정
            let maxZoom = 18;

            if (regionCode === '11000') {
              // 서울시 전체
              maxZoom = 11;
            } else if (regionCode === '41000') {
              // 경기도 전체
              maxZoom = 9;
            } else if (regionCode.startsWith('11000') && regionCode !== '11000') {
              // 서울시 구별
              maxZoom = 15;
            } else if (regionCode.startsWith('41000') && regionCode !== '41000') {
              // 경기도 시군구별
              maxZoom = 14;
            } else {
              // 다른 시도
              maxZoom = 12;
            }

            map.getView().fit(extent, {
              duration: 500,
              padding: [50, 50, 50, 50],
              maxZoom: maxZoom,
            });
          } else {
            toast.warning('해당 지역의 경계 데이터가 유효하지 않습니다.');
          }
        }

        // const regionName = regions.find((r) => r.code === regionCode)?.name || '선택된 지역';
        // toast.success(`${regionName} 경계가 표시되었습니다.`);

        // 캐시 상태 업데이트
        updateCacheStatus();
      } else {
        toast.error('해당 지역의 경계 데이터를 찾을 수 없습니다.');
      }
    } catch (error) {
      console.error('행정구역 경계 로드 실패:', error);
      toast.error('행정구역 경계를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegionChange = (event: any) => {
    const regionCode = event.target.value;
    setSelectedRegion(regionCode);

    if (regionCode === '11000') {
      // 서울특별시를 선택했을 때 구 선택 초기화하고 서울 전체 영역 표시
      setSelectedDistrict('');
      loadBoundary(regionCode);
    } else if (regionCode === '41000') {
      // 경기도를 선택했을 때 구 선택 초기화하고 경기도 전체 영역 표시
      setSelectedDistrict('');
      loadBoundary(regionCode);
    } else {
      setSelectedDistrict(''); // 다른 지역 선택시 구 선택 초기화
      if (regionCode) {
        loadBoundary(regionCode);
      } else {
        removeBoundary();
      }
    }
  };

  const handleDistrictChange = (event: any) => {
    const districtCode = event.target.value;
    setSelectedDistrict(districtCode);

    if (districtCode) {
      // 특정 구 선택
      loadBoundary(districtCode);
    } else {
      // 전체 시도 선택
      if (selectedRegion === '11000') {
        loadBoundary('11000');
      } else if (selectedRegion === '41000') {
        loadBoundary('41000');
      }
    }
  };

  const handleClearBoundary = () => {
    setSelectedRegion('');
    setSelectedDistrict('');
    removeBoundary();
  };

  const handleClearCache = () => {
    clearBoundaryCache();
    updateCacheStatus();
    toast.success('경계 데이터 캐시가 초기화되었습니다.');
  };

  if (!open) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 140,
        right: 10,
        backgroundColor: 'white',
        borderRadius: 2,
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        p: 3,
        maxWidth: 320,
        zIndex: 99999,
        maxHeight: '80vh',
        overflowY: 'auto',
        border: '2px solid #ccc',
      }}
    >
      <Typography variant='h6' sx={{ mb: 2, fontWeight: 'bold', color: '#333' }}>
        행정구역 경계 표시
      </Typography>

      <FormControl fullWidth size='small' sx={{ mb: 2 }}>
        <InputLabel>행정구역 선택</InputLabel>
        <Select
          value={selectedRegion}
          label='행정구역 선택'
          onChange={handleRegionChange}
          disabled={isLoading}
        >
          <MenuItem value=''>
            <em>선택하세요</em>
          </MenuItem>
          {regions.map((region) => (
            <MenuItem key={region.code} value={region.code}>
              {region.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* 서울시 구별 선택 */}
      {selectedRegion === '11000' && (
        <FormControl fullWidth size='small' sx={{ mb: 2 }}>
          <InputLabel>서울시 구별 선택</InputLabel>
          <Select
            value={selectedDistrict}
            label='서울시 구별 선택'
            onChange={handleDistrictChange}
            disabled={isLoading}
          >
            <MenuItem value=''>
              <em>전체 서울시</em>
            </MenuItem>
            {SEOUL_DISTRICTS.map((district) => (
              <MenuItem key={district.code} value={district.code}>
                {district.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {/* 경기도 시군구별 선택 */}
      {selectedRegion === '41000' && (
        <FormControl fullWidth size='small' sx={{ mb: 2 }}>
          <InputLabel>경기도 시군구별 선택</InputLabel>
          <Select
            value={selectedDistrict}
            label='경기도 시군구별 선택'
            onChange={handleDistrictChange}
            disabled={isLoading}
          >
            <MenuItem value=''>
              <em>전체 경기도</em>
            </MenuItem>
            {GYEONGGI_DISTRICTS.map((district) => (
              <MenuItem key={district.code} value={district.code}>
                {district.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button
          variant='outlined'
          size='small'
          onClick={handleClearBoundary}
          disabled={!selectedRegion || isLoading}
          sx={{ width: '50%' }}
        >
          경계 제거
        </Button>
        <Button
          variant='outlined'
          size='small'
          onClick={handleClearCache}
          disabled={isLoading}
          sx={{ width: '50%' }}
        >
          캐시 초기화
        </Button>
      </Box>

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <CircularProgress size={20} />
          <Typography variant='body2' sx={{ ml: 1, color: 'text.secondary' }}>
            경계 데이터 로딩 중...
          </Typography>
        </Box>
      )}

      {selectedRegion && (
        <Box sx={{ mt: 2, p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant='body2' color='text.secondary'>
            선택된 지역: {regions.find((r) => r.code === selectedRegion)?.name}
            {selectedDistrict && selectedRegion === '11000' && (
              <span> - {SEOUL_DISTRICTS.find((d) => d.code === selectedDistrict)?.name}</span>
            )}
            {selectedDistrict && selectedRegion === '41000' && (
              <span> - {GYEONGGI_DISTRICTS.find((d) => d.code === selectedDistrict)?.name}</span>
            )}
            {selectedRegion === '11000' && !selectedDistrict && <span> - 전체</span>}
            {selectedRegion === '41000' && !selectedDistrict && <span> - 전체</span>}
          </Typography>
        </Box>
      )}

      <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant='caption' color='text.secondary'>
          캐시 상태:
        </Typography>
        <Chip
          label={`${cacheStatus.size}개 지역`}
          size='small'
          color={cacheStatus.size > 0 ? 'primary' : 'default'}
          variant='outlined'
        />
      </Box>

      <Typography variant='caption' sx={{ mt: 2, display: 'block', color: 'text.secondary' }}>
        * WGS84 좌표계로 변환된 행정구역 경계 데이터를 로드하여 표시합니다.
      </Typography>
    </Box>
  );
};
