import { IfTbCamera } from '@/models/tb_camera';

const statIcon = (stat: IfTbCamera['cam_stat']) => {
  if (stat === 'Ok') {
    return '/images/camera_icon_green.png';
  } else if (stat === 'Err') {
    return '/images/camera_icon_red.png';
  }
  return '/images/camera_icon_gray.png';
};

const statColor = (stat: IfTbCamera['cam_stat']) => {
  if (stat === 'Ok') {
    return '#429e22';
  } else if (stat === 'Err') {
    return '#cc4655';
  }
  return '#9f9898';
};

export const camerautils = {
  statColor,
  statIcon,
};
