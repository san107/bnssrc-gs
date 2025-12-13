// @flow
import { IconButton } from '@mui/material';
import AllOutIcon from '@mui/icons-material/AllOut';
import * as React from 'react';
import { useDlgCameraView } from '@/app/(admin)/comp/popup/DlgCameraView';
import { IfTbCamera } from '@/models/tb_camera';
import { IfTbGate } from '@/models/gate/tb_gate';
import useSWR from 'swr';

type Props = {
  data?: IfTbCamera;
  gates?: IfTbGate;
  camSeq?: number;
};
export const BtnCameraExpand = ({ data, gates, camSeq }: Props) => {
  const [refCameraView, DlgCameraView] = useDlgCameraView();
  const { data: camera } = useSWR(camSeq ? [`/api/camera/one?camSeq=${camSeq}`] : undefined);

  return (
    <>
      <IconButton
        className='top-0 right-0'
        sx={{ position: 'absolute' }}
        onClick={() =>
          (data || camSeq) && refCameraView.current?.show(camSeq ? camera : data, false, gates)
        }
      >
        <AllOutIcon htmlColor='white' />
      </IconButton>
      <DlgCameraView />
    </>
  );
};
