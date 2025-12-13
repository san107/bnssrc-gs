import { Howl } from 'howler';

type AudioConfig = {
  src?: string;
  volume?: number;
  autoplay?: boolean;
  loop?: boolean;
  html5?: boolean;
};

export const createAlarmSound = (config: AudioConfig): Howl => {
  const sound = new Howl({
    src: [config.src ?? '/audio/alarm2.mp3'],
    volume: config.volume ?? 1.0,
    autoplay: config.autoplay ?? true,
    loop: config.loop ?? true,
    html5: config.html5 ?? true,
    onload: () => {
      console.log('Audio loaded');
    },
    onloaderror: (id: number, error: any) => {
      console.log('Audio load error:', id, error);
    },
    onplayerror: (id: number, error: any) => {
      console.log('Audio play error:', id, error);
      // 처음에 재생이 잘 되다 간혹 오류가 발생하는 경우가 있음. (브라우저 보안문제로 보임.)
      // 재생 오류 시 unlock 이벤트 후 재시도
      sound.on('unlock', () => {
        sound.play();
      });
    },
  });

  return sound;
};

export const stopAndUnloadAudio = (audio: Howl | null): void => {
  if (audio) {
    audio.stop();
    audio.unload();
  }
};
