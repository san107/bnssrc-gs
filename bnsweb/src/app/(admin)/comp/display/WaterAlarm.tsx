import { useState, useEffect } from 'react';
import { Grid } from '@mui/material';
import { IfTbWater } from '@/models/water/tb_water';
import * as waterutils from '@/utils/water-utils';
import { Howl } from 'howler';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import { createAlarmSound, stopAndUnloadAudio } from '@/utils/audio-utils';

type Props = {
  waters?: IfTbWater[];
  exAlarmOff?: () => void;
};

const WaterAlarm = ({ waters, exAlarmOff }: Props) => {
  const [audio, setAudio] = useState<Howl>(null);
  const [off, setOff] = useState<boolean>(true);

  useEffect(() => {
    const notification = document.getElementById('overlay-slidedown');
    if (!notification) return;

    // DOM 클래스 변경을 감지하기 위한 MutationObserver
    const observer = new MutationObserver(() => {
      const isVisible = notification.classList.contains('show');

      console.log('isVisible', isVisible);
      console.log('waters', waters);
      console.log('off', off);
      console.log('audio', audio);

      // 알람이 있고 팝업이 표시되어 있을 때만 소리 재생
      if (waters && waters.length > 0 && isVisible && off) {
        if (!audio) {
          const sound = createAlarmSound({});
          setAudio(sound);
          sound.play();
        }
      } else if (audio) {
        // 알람이 없거나 팝업이 닫혔을 때 소리 중지
        stopAndUnloadAudio(audio);
        setAudio(null);
      }
    });

    // 클래스 변경 감지 시작
    observer.observe(notification, {
      attributes: true,
      attributeFilter: ['class'],
    });

    // 초기 실행
    const isVisible = notification.classList.contains('show');
    if (waters && waters.length > 0 && isVisible && off) {
      if (!audio) {
        const sound = createAlarmSound({});
        setAudio(sound);
        sound.play();
      }
    } else if (audio) {
      stopAndUnloadAudio(audio);
      setAudio(null);
    }

    return () => {
      observer.disconnect();
      stopAndUnloadAudio(audio);
    };
  }, [waters, off, audio]);

  const soundOnOff = (action: boolean) => {
    stopAndUnloadAudio(audio);
    setAudio(null);
    setOff(action);
    if (action) {
      const notification = document.getElementById('overlay-slidedown');
      if (notification?.classList.contains('show')) {
        const sound = createAlarmSound({});
        setAudio(sound);
        sound.play();
      }
    }
  };

  const removeSound = () => {
    stopAndUnloadAudio(audio);
    setAudio(null);
  };

  return (
    <div className='full-overlay overlay-slidedown' id='overlay-slidedown'>
      <button
        type='button'
        className='overlay-close'
        onClick={() => {
          if (exAlarmOff) exAlarmOff();
          removeSound();
        }}
      >
        Close
      </button>
      <Grid container spacing={2}>
        <Grid size={12}>
          <div className='alarm-header'>
            {off ? (
              <VolumeUpIcon onClick={() => soundOnOff(false)} className='icon' />
            ) : (
              <VolumeOffIcon onClick={() => soundOnOff(true)} className='icon' />
            )}
            수위계에 문제가 발생하였습니다.
          </div>
        </Grid>
      </Grid>
      <Grid
        container
        direction='row'
        sx={{
          justifyContent: 'center',
          alignItems: 'center',
          paddingLeft: '50px',
          paddingRight: '50px',
        }}
        columns={{ xs: 1, sm: 4, md: 12 }}
      >
        {(waters || []).map((row) => (
          <Grid
            size={{ xs: 1, sm: 4, md: 6, lg: 3 }}
            sx={{ textAlign: 'center' }}
            key={row?.water_seq}
          >
            <div className='alarm-info-box'>
              <span className='alarm-info-title'>{row?.water_nm}</span>
              <span className='alarm-info neon'>{waterutils.waterLevelText(row?.water_stat)}</span>
            </div>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default WaterAlarm;
