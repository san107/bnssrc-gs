'use client';
import { IfTbEmcallGrp } from '@/models/emcall/tb_emcall_grp';
import useSWR from 'swr';
import { formStyles } from '@/app/(admin)/settings/comp/commStyles';
import { Box, BoxProps } from '@mui/material';
type Props = {
  emcallGrpSeq: number | undefined | null;
  label?: string;
};
export const EmcallGrpLabel = ({ emcallGrpSeq, label, style, ...props }: Props & BoxProps) => {
  const { data, isLoading } = useSWR<IfTbEmcallGrp>(
    !!emcallGrpSeq && ['/api/emcall_grp/one', { emcallGrpSeq }]
  );
  if (isLoading) return null;
  return (
    <Box component='span' style={{ ...formStyles.comboLabel, ...style }} {...props}>
      <em>{data?.emcall_grp_nm ?? label}</em>
    </Box>
  );
};
