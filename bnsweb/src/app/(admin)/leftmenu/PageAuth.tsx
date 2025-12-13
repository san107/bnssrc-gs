import { useEffect } from 'react';
import { useRouter, useSelectedLayoutSegment } from 'next/navigation';
import { useSysConf } from '@/store/useSysConf';

const PageAuth = () => {
  const router = useRouter();
  const segment = useSelectedLayoutSegment();
  // console.log('segment', segment);

  const { sysConf } = useSysConf();
  const isCamera = sysConf?.use_camera_yn === 'Y';
  const isGate = sysConf?.use_gate_yn === 'Y';
  const isWater = sysConf?.use_water_yn === 'Y';

  // 강제로 URL 입력 시 해당페이지를 불러올 수 없게 403 권한 에러 페이지로 이동.
  useEffect(() => {
    if (segment === 'camera' && !isCamera) {
      router.push('/403');
    }
    if (segment === 'gate' && !isGate) {
      router.push('/403');
    }
    if (segment === 'water' && !isWater) {
      router.push('/403');
    }
  }, [router, segment, isCamera, isGate, isWater]);
  return <></>;
};

export default PageAuth;
