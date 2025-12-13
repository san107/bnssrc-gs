import { IfTbEbrd } from '@/models/ebrd/tb_ebrd';

export const get_start_efcts = (ebrd_type: IfTbEbrd['ebrd_type']) => {
  if (ebrd_type === 'Noaled') {
    return [1, 2, 3, 4, 6, 7, 16, 18];
  }
  return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
};

export const get_end_efcts = (ebrd_type: IfTbEbrd['ebrd_type']) => {
  if (ebrd_type === 'Noaled') {
    return [1, 2, 3, 4, 5, 7, 12];
  }
  return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
};
