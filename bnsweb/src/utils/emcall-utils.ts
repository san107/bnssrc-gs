import { IfTbEmcall } from '@/models/emcall/tb_emcall';

export const getEmcallIcon = (emcall: IfTbEmcall) => {
  if (emcall.comm_stat === 'Ok') {
    return '/images/emcall_icon_green.png';
  } else if (emcall.comm_stat === 'Err') {
    return '/images/emcall_icon_red.png';
  } else {
    return '/images/emcall_icon_gray.png';
  }
};

export const emcallStatTxt = (stat: IfTbEmcall['comm_stat']) => {
  if (stat === 'Ok') {
    return '정상';
  } else if (stat === 'Err') {
    return '장애';
  } else {
    return 'N/A';
  }
};

export const emcallStatColor = (stat: IfTbEmcall['comm_stat']) => {
  if (stat === 'Ok') {
    return '#429e22';
  } else if (stat === 'Err') {
    return '#cc4655';
  } else {
    return '#9f9898';
  }
};
