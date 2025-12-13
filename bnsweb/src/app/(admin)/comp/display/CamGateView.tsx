import { CameraViewerEx } from '@/app/(admin)/comp/display/CameraViewerEx';
import { IfTbGate } from '@/models/gate/tb_gate';
import { Box, Alert, AlertTitle } from '@mui/material';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import ImageListItemBar from '@mui/material/ImageListItemBar';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import VideocamIcon from '@mui/icons-material/Videocam';

type Props = {
  gate_seq?: number;
  gateList?: IfTbGate[];
  enabled?: boolean;
};

const videoH = 178;
// const videoH = 170;

const CamGateView = ({ gateList, enabled = true }: Props) => {
  // useEffect(() => {
  //   // console.log('gateList', gateList);
  //   console.log('게이트 카메라 출력');
  //   gateList?.map((ele) => {
  //     console.log('cam_seq:%s, gate_nm:%s', ele?.cam_seq, ele?.gate_nm);
  //   });
  // }, [gateList]);

  return (
    <Box className='camera-right'>
      <Alert
        severity='info'
        sx={{
          mb: '10px !important',
          backgroundColor: '#4a819c !important',
          border: '1px solid #2196f3',
          borderRadius: 1,
          '& .MuiAlert-icon': {
            color: '#c7c3c3 !important',
          },
          '& .MuiAlert-message': {
            fontSize: '14px',
            fontWeight: 500,
          },
        }}
      >
        <AlertTitle sx={{ fontSize: '14px', fontWeight: 500 }}>
          카메라가 10대가 넘으면 기본으로 카메라를 Off 상태로 설정합니다.
        </AlertTitle>
        개별 제어 기능을 사용하려면 버튼을 클릭하세요.
        <VideocamIcon sx={{ ml: 1, verticalAlign: 'middle', color: '#4caf50' }} />
        (끄기),
        <VideocamOffIcon sx={{ ml: 1, verticalAlign: 'middle', color: '#ff4444' }} />
        (켜기)
      </Alert>

      {/* 게이트의 주 카메라를 보여준다. */}
      <ImageList
        sx={{
          width: 500,
          maxHeight: 580,
          color: '#fff',
          textAlign: 'center',
          padding: '10px',
          borderRadius: 0,
          border: '1px solid #4f5252',
          backgroundColor: '#40474d',
          // backgroundColor: '#404040',
          // boxShadow: '0px 0px 0px 1px rgba(0, 0, 0, 0.2)',
          overflowY: 'auto',
        }}
      >
        {(gateList || []).map((row) => (
          <ImageListItem
            key={row?.gate_seq}
            sx={{
              border: '1px solid #666',
              borderRadius: 1,
              margin: '1px',
              backgroundColor: '#2e3239',
            }}
          >
            <CameraViewerEx cam_seq={row?.cam_seq} minHeight={videoH} enabled={enabled} />
            <ImageListItemBar
              title={row.gate_nm}
              position='below'
              sx={{
                background: 'rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(8px)',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                '& .MuiImageListItemBar-title': {
                  fontSize: '13px',
                  fontWeight: 500,
                  color: '#ffffff',
                  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                  letterSpacing: '0.3px',
                },
                '& .MuiImageListItemBar-titleWrap': {
                  padding: '6px 8px',
                },
              }}
            />
          </ImageListItem>
        ))}
      </ImageList>
    </Box>
  );
};

export default CamGateView;
