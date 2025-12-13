'use client';

import React, { useEffect, useState } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useSysConf } from '@/store/useSysConf';
import { Box } from '@mui/material';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  useDndContext,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import CloudySnowingIcon from '@mui/icons-material/CloudySnowing';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ListAltIcon from '@mui/icons-material/ListAlt';
import { useMobile } from '@/hooks/useMobile';
import BarChartIcon from '@mui/icons-material/BarChart';
import { useDroppable } from '@dnd-kit/core';

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
  size: number;
  borderColor: string;
}

const SortableItem = ({ id, children, size, borderColor }: SortableItemProps) => {
  const { active } = useDndContext();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    data: {
      type: 'item',
      size,
    },
  });

  const { isOver, setNodeRef: setDroppableRef } = useDroppable({
    id,
    data: {
      type: 'item',
      size,
    },
  });

  const { isMobile } = useMobile();

  const activeItem = active?.data.current as { type: string; size: number } | undefined;
  const isActive = active?.id === id;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
    cursor: 'move',
    gridColumn: isMobile ? 'span 12' : `span ${size}`,
    border: `2px solid ${borderColor}`,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
    width: '100%',
    height: '160px',
    position: 'relative' as const,
    backgroundColor: '#1a1a1a',
    borderRadius: '8px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    boxShadow: `0 0 8px ${borderColor}40`,
    willChange: isDragging ? 'transform' : 'auto',
    touchAction: 'none',
  };

  const droppableStyle = {
    gridColumn: isMobile ? 'span 12' : `span ${size}`,
    position: 'relative' as const,
    minHeight: '160px',
    willChange: isOver ? 'transform' : 'auto',
  };

  return (
    <div ref={setDroppableRef} style={droppableStyle}>
      <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
        {children}
      </div>
      {isOver && !isActive && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            border: '2px dashed #666',
            borderRadius: '8px',
            pointerEvents: 'none',
            backgroundColor: 'rgba(0,0,0,0.02)',
            zIndex: 1,
            willChange: 'transform',
            gridColumn: isMobile ? 'span 12' : `span ${activeItem?.size || size}`,
          }}
        />
      )}
    </div>
  );
};

const Preview = () => {
  const {
    theme,
    showWeather,
    showWeatherForecast,
    showWaterLocation,
    showWaterStatus,
    showWaterStats,
    showGateStats,
    showCameraList,
    showWaterList,
    showGateList,
    showEbrdList,
    showEmcallList,
    dashboardOrder,
    setDashboardOrder,
  } = useSettingsStore();
  const { sysConf } = useSysConf();
  const [mounted, setMounted] = useState(false);

  const items = [
    {
      id: 'weather',
      show: showWeather && sysConf.use_weather_yn === 'Y',
      title: '날씨 정보',
      description: '현재 날씨 정보를 표시',
      size: 4,
      borderColor: '#FF9800',
      icon: <WbSunnyIcon sx={{ fontSize: 40 }} />,
    },
    {
      id: 'weatherForecast',
      show: showWeatherForecast && sysConf.use_weather_yn === 'Y',
      title: '날씨 예보',
      description: '강수 확률, 풍속 예측 정보를 그래프로 표시',
      size: 8,
      borderColor: '#ffe600',
      icon: <CloudySnowingIcon sx={{ fontSize: 40 }} />,
    },
    {
      id: 'waterLocation',
      show: showWaterLocation && sysConf.use_water_yn === 'Y',
      title: '수위계 위치',
      description: '수위계 위치를 지도에 표시',
      size: 4,
      borderColor: '#4CAF50',
      icon: <LocationOnIcon sx={{ fontSize: 40 }} />,
    },
    {
      id: 'waterStatus',
      show: showWaterStatus && sysConf.use_water_yn === 'Y',
      title: '수위계 상태',
      description: '현재 수위 상태와 변화를 실시간 그래프로 표시',
      size: 8,
      borderColor: '#2196F3',
      icon: <WaterDropIcon sx={{ fontSize: 40 }} />,
    },
    {
      id: 'waterStats',
      show: showWaterStats && sysConf.use_water_yn === 'Y',
      title: '수위계 월별 통계',
      description: '월별로 수위계의 수위레벨 상태값 통계를 그래프로 표시시',
      size: 12,
      borderColor: '#989797',
      icon: <BarChartIcon sx={{ fontSize: 40 }} />,
    },
    {
      id: 'gateStats',
      show: showGateStats && sysConf.use_gate_yn === 'Y',
      title: '차단장비 월별 통계',
      description: '월별로 차단장비를 제어한 횟수 통계를 그래프로 표시',
      size: 12,
      borderColor: '#aa6e2a',
      icon: <BarChartIcon sx={{ fontSize: 40 }} />,
    },
    {
      id: 'cameraList',
      show: showCameraList && sysConf.use_camera_yn === 'Y',
      title: '카메라 목록',
      description: '등록된 카메라 목록을 표시',
      size: 4,
      borderColor: '#00BCD4',
      icon: <ListAltIcon sx={{ fontSize: 40 }} />,
    },
    {
      id: 'waterList',
      show: showWaterList && sysConf.use_water_yn === 'Y',
      title: '수위계 목록',
      description: '등록된 수위계 목록을 표시',
      size: 4,
      borderColor: '#9C27B0',
      icon: <ListAltIcon sx={{ fontSize: 40 }} />,
    },
    {
      id: 'gateList',
      show: showGateList && sysConf.use_gate_yn === 'Y',
      title: '차단장비 목록',
      description: '등록된 차단장비 목록을 표시',
      size: 4,
      borderColor: '#F44336',
      icon: <ListAltIcon sx={{ fontSize: 40 }} />,
    },
    {
      id: 'ebrdList',
      show: showEbrdList && sysConf.use_ebrd_yn === 'Y',
      title: '전광판 목록',
      description: '등록된 전광판 목록을 표시',
      size: 4,
      borderColor: '#bbd400',
      icon: <ListAltIcon sx={{ fontSize: 40 }} />,
    },
    {
      id: 'emcallList',
      show: showEmcallList && sysConf.use_emcall_yn === 'Y',
      title: '비상통화장치 목록',
      description: '등록된 비상통화장치 목록을 표시',
      size: 4,
      borderColor: '#00d491',
      icon: <ListAltIcon sx={{ fontSize: 40 }} />,
    },
  ].sort((a, b) => dashboardOrder.indexOf(a.id) - dashboardOrder.indexOf(b.id));

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
        delay: 0,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeItem = items.find((item) => item.id === active.id);
    const overItem = items.find((item) => item.id === over.id);

    if (!activeItem || !overItem) return;
  };

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;

    if (over && active.id !== over.id) {
      const oldIndex = dashboardOrder.indexOf(active.id as string);
      const newIndex = dashboardOrder.indexOf(over.id as string);

      const newOrder = arrayMove(dashboardOrder, oldIndex, newIndex);
      setDashboardOrder(newOrder);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Box className='dashbd'>
      <Box className={theme === 'light' ? 'white-content' : ''}>
        <div style={{ padding: '20px' }}>
          <div className='content'>
            {mounted && (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
              >
                <SortableContext
                  items={items.map((item) => item.id)}
                  strategy={rectSortingStrategy}
                >
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(12, 1fr)',
                      gap: '20px',
                      width: '100%',
                      position: 'relative',
                      transform: 'translate3d(0, 0, 0)',
                      backfaceVisibility: 'hidden',
                      perspective: '1000px',
                      alignItems: 'stretch',
                    }}
                  >
                    {items.map(
                      (item) =>
                        item.show && (
                          <SortableItem
                            key={item.id}
                            id={item.id}
                            size={item.size}
                            borderColor={item.borderColor}
                          >
                            <div
                              style={{
                                color: item.borderColor,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              {item.icon}
                            </div>
                            <div
                              style={{
                                fontSize: '16px',
                                fontWeight: 'bold',
                                color: theme === 'dark' ? '#fff' : '#333',
                              }}
                            >
                              {item.title}
                            </div>
                            <div
                              style={{
                                fontSize: '14px',
                                color: theme === 'dark' ? '#ccc' : '#666',
                                textAlign: 'center',
                              }}
                            >
                              {item.description}
                            </div>
                          </SortableItem>
                        )
                    )}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>
      </Box>
    </Box>
  );
};

export default Preview;
