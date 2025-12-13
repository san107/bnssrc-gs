import React from 'react';
import { CameraViewer } from '@/app/(admin)/comp/display/CameraViewer';
import useSWR from 'swr';

type Props = {
  cam_seq?: number;
  show: boolean;
  setShow: (b: boolean) => void;
};

const videoZoomW = 640;
const videoZoomH = 480;

const CamZoomInView = ({ cam_seq, show, setShow }: Props) => {
  const { data } = useSWR(cam_seq ? [`/api/camera/one?camSeq=${cam_seq}`] : undefined);

  const handleClickClose = () => {
    // const notification = document.getElementById('camera-zoomin-container');
    // if (notification) notification?.classList.remove('show');
    // 클래스로 show, hide 하는 경우, JSMPEG Player가 열린 상태로 종료되지 않는 현상이 있어, show/hide 를 변수로 관리함.
    setShow(false);
  };

  return (
    <div className='camera-zoomin'>
      {show && (
        <div className='camera-zoomin-container show' id='camera-zoomin-container'>
          <div className='camera-zoomin-header'>
            <span
              className='icon icon-small-close'
              id='notification-close'
              onClick={handleClickClose}
            ></span>
            {data?.cam_nm}
          </div>
          <CameraViewer cam_seq={cam_seq} width={videoZoomW} minHeight={videoZoomH} small={false} />
        </div>
      )}
    </div>
  );
};

export default CamZoomInView;
