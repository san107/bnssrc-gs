'use client';
import { CameraViewer } from '@/app/(admin)/comp/display/CameraViewer';
import { CameraList, RefProps } from '@/app/(admin)/dashbd/camera/CameraList';
import { IfTbCamera } from '@/models/tb_camera';
import styled from '@emotion/styled';
import { Typography, Button, ButtonGroup, IconButton } from '@mui/material';
import { useEffect, useRef, useState, useCallback } from 'react';
import { GiCctvCamera } from 'react-icons/gi';
import { useIsMounted } from '@/hooks/useIsMounted';
import LooksTwoIcon from '@mui/icons-material/LooksTwo';
import Looks3Icon from '@mui/icons-material/Looks3';
import Looks4Icon from '@mui/icons-material/Looks4';
import Looks5Icon from '@mui/icons-material/Looks5';
import Looks6Icon from '@mui/icons-material/Looks6';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import CloseIcon from '@mui/icons-material/Close';
import TuneIcon from '@mui/icons-material/Tune';
import { useMobile } from '@/hooks/useMobile';
import { ProtectedComponent } from '@/abilities/abilities';

type Props = {};

// localstorage 키
const LAYOUT_STORAGE_KEY = 'camera_layout_columns';
const LAYOUT_STORAGE_KEY_MOBILE = 'camera_layout_columns_mobile';

const Index = (_props: Props) => {
  const isMounted = useIsMounted();
  const { isMobile } = useMobile();
  const [checks, setChecks] = useState<IfTbCamera[]>([]);
  const [localChecks, setLocalChecks] = useState<IfTbCamera[]>([]);

  // localstorage 에서 레이아웃 설정 불러오기
  const getInitialColumns = useCallback((): number => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(isMobile ? LAYOUT_STORAGE_KEY_MOBILE : LAYOUT_STORAGE_KEY);
      if (saved) {
        const parsed = parseInt(saved, 10);
        if ((isMobile ? [1, 2] : [2, 3, 4, 5, 6, 7, 8, 9, 10]).includes(parsed)) {
          return parsed;
        }
      }
    }
    return isMobile ? 2 : 4; // 기본값
  }, [isMobile]);

  const [columnsPerRow, setColumnsPerRow] = useState<number>(getInitialColumns);
  const [cameraWidth, setCameraWidth] = useState<number>(355);
  const [showLayoutControls, setShowLayoutControls] = useState(true);
  const [isClosing, setIsClosing] = useState(false);
  const [isOpening, setIsOpening] = useState(false);

  useEffect(() => {
    setColumnsPerRow(getInitialColumns());
  }, [isMobile, getInitialColumns]);

  // localstorage 에 저장
  const saveLayoutSetting = (columns: number) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        isMobile ? LAYOUT_STORAGE_KEY_MOBILE : LAYOUT_STORAGE_KEY,
        columns.toString()
      );
    }
  };

  // 레이아웃 변경 핸들러
  const handleLayoutChange = (columns: number) => {
    setColumnsPerRow(columns);
    saveLayoutSetting(columns);
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowLayoutControls(false);
      setIsClosing(false);
    }, 300);
  };

  const handleOpen = () => {
    setShowLayoutControls(true);
    setIsOpening(true);
    setTimeout(() => {
      setIsOpening(false);
    }, 300);
  };

  useEffect(() => {
    const arr: IfTbCamera[] = checks.filter(
      (ele) => !!localChecks.find((local) => local.cam_seq === ele.cam_seq)
    );

    const timerid: undefined | NodeJS.Timeout = setInterval(() => {
      //if (checks.length !== localChecks.length) return false;

      const issame = checks.reduce((acc, cur) => {
        if (acc === false) return false;
        if (localChecks.find((e) => e.cam_seq === cur.cam_seq)) {
          return true;
        }
        arr.push(cur);
        return false;
      }, true);
      if (issame && checks.length === arr.length && arr.length === localChecks.length) {
        clearInterval(timerid);
        return;
      } else {
        setLocalChecks(arr);
      }
    }, 500);
    return () => {
      clearInterval(timerid);
    };
  }, [checks, localChecks]);

  const calculateCameraWidth = useCallback(() => {
    const containerWidth = window.innerWidth - 80;
    const gap = 16;
    const availableWidth = containerWidth - gap * (columnsPerRow - 1);
    const calculatedWidth = Math.floor(availableWidth / columnsPerRow);
    return Math.max(calculatedWidth, 200);
  }, [columnsPerRow]);

  // 윈도우 리사이즈 이벤트 처리
  useEffect(() => {
    const handleResize = () => {
      setCameraWidth(calculateCameraWidth());
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [columnsPerRow, calculateCameraWidth]);

  const cameraListRef = useRef<RefProps>(null);
  if (!isMounted) return null;

  const getIconMap = {
    2: <LooksTwoIcon />,
    3: <Looks3Icon />,
    4: <Looks4Icon />,
    5: <Looks5Icon />,
    6: <Looks6Icon />,
  };

  return (
    <ProtectedComponent action='view' subject='dashbd'>
      <Body onClick={() => cameraListRef.current?.toggle()}>
        {showLayoutControls ? (
          <LayoutControls
            onClick={(e) => e.stopPropagation()}
            className={`${isClosing ? 'closing' : ''} ${isOpening ? 'opening' : ''}`}
          >
            <LayoutTitle variant='h6'>카메라 보기 (컬럼 기준)</LayoutTitle>
            <StyledButtonGroup variant='outlined' size='small'>
              {(isMobile ? [1, 2] : [2, 3, 4, 5, 6, 7, 8, 9, 10]).map((ele) => (
                <StyledButton
                  key={ele}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLayoutChange(ele);
                  }}
                  variant={columnsPerRow === ele ? 'contained' : 'outlined'}
                  startIcon={
                    isMobile ? undefined : getIconMap[ele] ? getIconMap[ele] : <RemoveRedEyeIcon />
                  }
                >
                  {ele}개
                </StyledButton>
              ))}
            </StyledButtonGroup>
            <IconButton
              size='small'
              sx={{ marginLeft: 1, color: '#4CBE83' }}
              onClick={(e) => {
                e.stopPropagation();
                handleClose();
              }}
            >
              <CloseIcon />
            </IconButton>
          </LayoutControls>
        ) : (
          <OpenLayoutButton
            onClick={(e) => {
              e.stopPropagation();
              handleOpen();
            }}
            className={`${isClosing ? 'closing' : ''} ${isOpening ? 'opening' : ''}`}
          >
            <TuneIcon />
          </OpenLayoutButton>
        )}

        <ComeraBody>
          <Inner columnsPerRow={columnsPerRow}>
            {localChecks.map((ele) => (
              <CameraViewer
                key={ele.cam_seq}
                cam_seq={ele.cam_seq}
                width={cameraWidth}
                title={ele.cam_nm}
              />
            ))}
          </Inner>
          {localChecks.length === 0 && (
            <EmptyState>
              <OrbitingParticle size={4} duration={10} />
              <OrbitingParticle
                size={3}
                duration={8}
                delay={-2}
                style={{ transform: 'translate(-100px, -50px)' }}
              />
              <OrbitingParticle
                size={5}
                duration={12}
                delay={-4}
                style={{ transform: 'translate(100px, 50px)' }}
              />
              <OrbitingParticle
                size={3}
                duration={9}
                delay={-6}
                style={{ transform: 'translate(50px, -100px)' }}
              />
              <OrbitingParticle
                size={4}
                duration={11}
                delay={-8}
                style={{ transform: 'translate(-50px, 100px)' }}
              />
              <CctvIcon
                style={{
                  fontSize: 140,
                  color: '#ffffff',
                  opacity: 0.7,
                  marginBottom: 16,
                }}
              />
              <EmptyStateText variant='h5'>표시할 카메라를 선택하여 주십시오.</EmptyStateText>
            </EmptyState>
          )}
        </ComeraBody>

        <CameraList checks={checks} setChecks={setChecks} ref={cameraListRef} />
      </Body>
    </ProtectedComponent>
  );
};

const Body = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  //background-color: #eee;
  //background-color: #1e1e29;
  //background-color: #424242;
  //background-color: #929292;
  background-color: #1a1a1a;
  padding: 10px;
  box-sizing: border-box;
`;

const LayoutControls = styled.div`
  position: absolute;
  top: 20px;
  left: 24px;
  z-index: 1000;
  background: transparent;
  padding: 12px 16px;
  border-radius: 8px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  gap: 12px;
  transform-origin: top left;
  transition: all 0.3s ease-out;
  opacity: 1;
  transform: translateX(0) scale(1);

  &.closing {
    opacity: 0;
    transform: translateX(-20px) scale(0.95);
  }
  &.opening {
    animation: slideInFade 0.3s ease-out;
  }
`;

const LayoutTitle = styled(Typography)`
  color: #4cbe83;
  font-weight: 500;
  white-space: nowrap;
`;

const StyledButtonGroup = styled(ButtonGroup)`
  .MuiButtonGroup-grouped:not(:last-of-type) {
    border-right: 1px solid #4cbe83;
  }
`;

const StyledButton = styled(Button)`
  color: ${(props) => (props.variant === 'contained' ? '#fff' : '#36a571')};
  border-color: #36a571;

  &:hover {
    border-color: #36a571;
    background-color: rgba(76, 190, 131, 0.1);
  }

  &.MuiButton-contained {
    background-color: #36a571;
  }
`;

const OpenLayoutButton = styled(IconButton)`
  position: absolute;
  top: 20px;
  left: 24px;
  z-index: 1000;
  background: #1976d2;
  color: #fff;

  &:hover {
    background: #4e9ef8;
  }
`;

const ComeraBody = styled.div`
  width: 100%;
  height: 100%;
  overflow-y: auto;
  //display: flex;
  //flex-wrap: wrap;
  /* border-radius: 8px; */
  /* background-color: #424242; */
  //background-color: #343434;
  background: linear-gradient(45deg, #000428, #004e92);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #1a1a1a;
  }

  &::-webkit-scrollbar-thumb {
    background: #424242;
    border-radius: 4px;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: radial-gradient(1px 1px at 20px 30px, #fff, rgba(0, 0, 0, 0)),
      radial-gradient(1px 1px at 40px 70px, #fff, rgba(0, 0, 0, 0)),
      radial-gradient(1px 1px at 50px 160px, #fff, rgba(0, 0, 0, 0)),
      radial-gradient(1px 1px at 90px 40px, #fff, rgba(0, 0, 0, 0)),
      radial-gradient(1px 1px at 130px 80px, #fff, rgba(0, 0, 0, 0)),
      radial-gradient(1px 1px at 160px 120px, #fff, rgba(0, 0, 0, 0)),
      radial-gradient(2px 2px at 60px 20px, #fff, rgba(0, 0, 0, 0)),
      radial-gradient(2px 2px at 100px 150px, #fff, rgba(0, 0, 0, 0)),
      radial-gradient(2px 2px at 150px 50px, #fff, rgba(0, 0, 0, 0)),
      radial-gradient(2px 2px at 180px 90px, #fff, rgba(0, 0, 0, 0)),
      radial-gradient(3px 3px at 30px 100px, #fff, rgba(0, 0, 0, 0));
    background-repeat: repeat;
    background-size: 200px 200px;
    animation: twinkle 4s ease-in-out infinite;
    opacity: 0.3;
  }
`;

const Inner = styled.div<{ columnsPerRow: number }>`
  display: grid;
  grid-template-columns: repeat(${(props) => props.columnsPerRow}, 1fr);
  gap: 16px;
  padding-top: 80px;
  /* padding-left: 24px; */
  /* padding-right: 24px; */
  padding-bottom: 16px;
  box-sizing: border-box;
`;

const EmptyState = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
  background: linear-gradient(45deg, #000428, #004e92);

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, transparent, #00ff00, transparent);
    animation: scan 2s linear infinite;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: radial-gradient(1px 1px at 20px 30px, #fff, rgba(0, 0, 0, 0)),
      radial-gradient(1px 1px at 40px 70px, #fff, rgba(0, 0, 0, 0)),
      radial-gradient(1px 1px at 50px 160px, #fff, rgba(0, 0, 0, 0)),
      radial-gradient(1px 1px at 90px 40px, #fff, rgba(0, 0, 0, 0)),
      radial-gradient(1px 1px at 130px 80px, #fff, rgba(0, 0, 0, 0)),
      radial-gradient(1px 1px at 160px 120px, #fff, rgba(0, 0, 0, 0)),
      radial-gradient(2px 2px at 60px 20px, #fff, rgba(0, 0, 0, 0)),
      radial-gradient(2px 2px at 100px 150px, #fff, rgba(0, 0, 0, 0)),
      radial-gradient(2px 2px at 150px 50px, #fff, rgba(0, 0, 0, 0)),
      radial-gradient(2px 2px at 180px 90px, #fff, rgba(0, 0, 0, 0)),
      radial-gradient(3px 3px at 30px 100px, #fff, rgba(0, 0, 0, 0));
    background-repeat: repeat;
    background-size: 200px 200px;
    animation: twinkle 4s ease-in-out infinite;
    opacity: 0.3;
  }
`;

const EmptyStateText = styled(Typography)`
  color: #4cbe83;
  text-align: center;
  font-weight: 500;
  margin-top: 44px;
  font-size: 1.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  animation: typewriter 2s steps(20) 1s 1 normal both, blinkCursor 0.8s steps(2) 1s infinite;
  white-space: nowrap;
  overflow: hidden;
  border-right: 3px solid #4cbe83;
`;

const CctvIcon = styled(GiCctvCamera)`
  position: relative;
  animation: glow 2s ease-in-out infinite, hithere 10s ease-in-out infinite;
`;

const OrbitingParticle = styled.div<{ delay?: number; size?: number; duration?: number }>`
  position: absolute;
  top: 50%;
  left: 50%;
  width: ${(props) => props.size || 4}px;
  height: ${(props) => props.size || 4}px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
  animation: orbit ${(props) => props.duration || 10}s linear infinite;
  animation-delay: ${(props) => props.delay || 0}s;
`;

export default Index;
