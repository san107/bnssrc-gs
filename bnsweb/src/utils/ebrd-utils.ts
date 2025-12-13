import { IfTbEbrd } from '@/models/ebrd/tb_ebrd';

export const getEbrdIcon = (ebrd: IfTbEbrd) => {
  if (ebrd.comm_stat === 'Ok') {
    return '/images/ebrd_icon_green.png';
  } else if (ebrd.comm_stat === 'Err') {
    return '/images/ebrd_icon_red.png';
  } else {
    return '/images/ebrd_icon_gray.png';
  }
};

export const ebrdStatTxt = (stat: IfTbEbrd['comm_stat']) => {
  if (stat === 'Ok') {
    return '정상';
  } else if (stat === 'Err') {
    return '장애';
  } else {
    return 'N/A';
  }
};

export const ebrdStatColor = (stat: IfTbEbrd['comm_stat']) => {
  if (stat === 'Ok') {
    return '#429e22';
  } else if (stat === 'Err') {
    return '#cc4655';
  } else {
    return '#9f9898';
  }
};
