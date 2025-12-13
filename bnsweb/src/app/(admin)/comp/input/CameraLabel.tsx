'use client';
import { IfTbCamera } from '@/models/tb_camera';
import useSWR from 'swr';
import { formStyles } from '@/app/(admin)/settings/comp/commStyles';
type Props = {
  camSeq: number | undefined | null;
  label?: string;
  style?: boolean;
};
export const CameraLabel = ({ camSeq, label, style = true }: Props) => {
  const { data, isLoading } = useSWR<IfTbCamera>(!!camSeq && ['/api/camera/one', { camSeq }]);

  if (isLoading) return null;
  return (
    <span style={style ? formStyles.comboLabel : {}}>
      {style ? <em>{data?.cam_nm ?? label}</em> : data?.cam_nm ?? label}
    </span>
  );
};
