// @flow
import { CdIdCombo } from '@/app/(admin)/comp/input/CdIdCombo';
import { useConfirm } from '@/app/(admin)/comp/popup/DlgConfirm';
import { useDlgMap } from '@/app/(admin)/comp/popup/DlgMap';
import { FormTd, FormTh, FormTr } from '@/app/(admin)/comp/table/FormTbl';
import { SettingBtn } from '@/app/(admin)/settings/alm/SettingBtn';
import { SettingTitle } from '@/app/(admin)/settings/comp/SettingTitle';
import {
  StyledCard,
  StyledBox,
  StyledFormTbl,
  StyledCardActions,
} from '@/app/(admin)/settings/comp/StyledForm';
import { IfTbCamera, TbCamera } from '@/models/tb_camera';
import { Box, SvgIcon, TextField, Typography } from '@mui/material';
import axios from 'axios';
import SettingsIcon from '@mui/icons-material/Settings';
import { toast } from 'sonner';
import { useSWRConfig } from 'swr';
import { GrpCombo } from '@/app/(admin)/comp/input/GrpCombo';
import { handleDialogRejection } from '@/utils/dialog-utils';

type Props = {
  sel: IfTbCamera;
  setSel: (v: IfTbCamera) => void;
};

export const FormCamera = ({ sel, setSel }: Props) => {
  const { mutate } = useSWRConfig();

  const handleReset = () => {
    setSel(new TbCamera());
  };

  const handleNewSave = () => {
    const copySel = { ...sel };
    delete copySel.cam_seq; // 일련번호 제거
    axios
      .post('/api/camera/save', copySel)
      .then((res) => {
        setSel(res.data);
        toast.success('신규로 카메라를 등록하였습니다');
        mutate(() => true);
      })
      .catch((e) => {
        console.error('E', e);
        toast.error('실패하였습니다.(error : ' + e?.message + ')');
      });
  };

  const handleUpdate = () => {
    axios
      .post('/api/camera/save', sel)
      .then((res) => {
        setSel(res.data);
        toast.success('수정하였습니다');
        mutate(() => true);
      })
      .catch((e) => {
        console.error('E', e);
        toast.error('실패하였습니다.(error : ' + e?.message + ')');
      });
  };

  const confirm = useConfirm();
  const handleDelete = () => {
    confirm('확인', ['삭제하시겠습니까'])
      ?.then(() => {
        console.log('삭제 확인. ');
        axios
          .post('/api/camera/delete', sel)
          .then((res) => {
            console.log('res', res.data);
            toast.success('삭제 하였습니다');
            setSel(new TbCamera());
            mutate(() => true);
          })
          .catch((e) => {
            console.error('E', e);
            toast.error('실패하였습니다(' + e?.message + ')');
          });
      })
      .catch((e) => {
        // 취소
        console.log('취소. ', e);
      });
  };

  const handleClickLatLng = () => {
    const pos = (n?: number) => (n && n < 20 ? undefined : n); //잘못된 위경도인 겨우, undefined로 리턴함.
    dlgMap.current
      ?.show('카메라 좌표 선택', { lat: pos(sel.cam_lat), lng: pos(sel.cam_lng) })
      .then((res) => {
        setSel({ ...sel, cam_lat: res.lat, cam_lng: res.lng });
        toast.info('선택 하였습니다');
      })
      .catch((rejection) => {
        handleDialogRejection(rejection);
      });
  };

  const [dlgMap, DlgMap] = useDlgMap();
  //const [cameraView, CameraView] = useDlgCameraView();

  return (
    <StyledCard>
      <SettingTitle>
        <StyledBox>
          <SvgIcon fontSize='large'>
            <SettingsIcon />
          </SvgIcon>
        </StyledBox>
        <Box>
          <Typography variant='h5' fontWeight={700} color='text.primary'>
            카메라 설정
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            카메라의 정보를 설정합니다.
          </Typography>
        </Box>
      </SettingTitle>

      <Box sx={{ mt: 3, flexGrow: 1, overflowY: 'auto' }}>
        <form>
          <StyledFormTbl width={'100%'}>
            <colgroup>
              <col width={'35%'} />
              <col width={'65%'} />
            </colgroup>
            <tbody>
              <FormTr>
                <FormTh>이름</FormTh>
                <FormTd sx={{ pr: 3 }}>
                  <TextField
                    fullWidth
                    size='small'
                    value={sel?.cam_nm || ''}
                    onChange={(e) => setSel({ ...sel, cam_nm: e.target.value })}
                  />
                </FormTd>
              </FormTr>
              <FormTr>
                <FormTh>위도</FormTh>
                <FormTd sx={{ pr: 3 }}>
                  <TextField
                    fullWidth
                    size='small'
                    value={sel?.cam_lat || ''}
                    onClick={handleClickLatLng}
                    placeholder='지도에서 선택하세요'
                  />
                </FormTd>
              </FormTr>
              <FormTr>
                <FormTh>경도</FormTh>
                <FormTd sx={{ pr: 3 }}>
                  <TextField
                    fullWidth
                    size='small'
                    value={sel?.cam_lng || ''}
                    onClick={handleClickLatLng}
                    placeholder='지도에서 선택하세요'
                  />
                </FormTd>
              </FormTr>
              <FormTr>
                <FormTh>IP</FormTh>
                <FormTd sx={{ pr: 3 }}>
                  <TextField
                    fullWidth
                    size='small'
                    value={sel?.cam_ip || ''}
                    onChange={(e) => setSel({ ...sel, cam_ip: e.target.value })}
                  />
                </FormTd>
              </FormTr>
              <FormTr>
                <FormTh>Port</FormTh>
                <FormTd sx={{ pr: 3 }}>
                  <TextField
                    fullWidth
                    size='small'
                    value={sel?.cam_port || ''}
                    onChange={(e) =>
                      parseInt(e.target.value) &&
                      setSel({ ...sel, cam_port: parseInt(e.target.value) })
                    }
                  />
                </FormTd>
              </FormTr>
              <FormTr>
                <FormTh>아이디</FormTh>
                <FormTd sx={{ pr: 3 }}>
                  <TextField
                    fullWidth
                    size='small'
                    value={sel?.cam_user_id || ''}
                    onChange={(e) => setSel({ ...sel, cam_user_id: e.target.value })}
                  />
                </FormTd>
              </FormTr>
              <FormTr>
                <FormTh>패스워드</FormTh>
                <FormTd sx={{ pr: 3 }}>
                  <TextField
                    fullWidth
                    size='small'
                    type='password'
                    value={sel?.cam_pass || ''}
                    onChange={(e) => setSel({ ...sel, cam_pass: e.target.value })}
                  />
                </FormTd>
              </FormTr>
              <FormTr>
                <FormTh>저해상도경로</FormTh>
                <FormTd sx={{ pr: 3 }}>
                  <TextField
                    fullWidth
                    size='small'
                    value={sel?.cam_path_s || ''}
                    onChange={(e) => setSel({ ...sel, cam_path_s: e.target.value })}
                  />
                </FormTd>
              </FormTr>
              <FormTr>
                <FormTh>고해상도경로</FormTh>
                <FormTd sx={{ pr: 3 }}>
                  <TextField
                    fullWidth
                    size='small'
                    value={sel?.cam_path_l || ''}
                    onChange={(e) => setSel({ ...sel, cam_path_l: e.target.value })}
                  />
                </FormTd>
              </FormTr>
              <FormTr>
                <FormTh>타입</FormTh>
                <FormTd sx={{ pr: 3 }}>
                  <CdIdCombo
                    value={sel?.cam_type || ''}
                    grp='CT'
                    onChange={(e) => setSel({ ...sel, cam_type: e.target.value })}
                  />
                </FormTd>
              </FormTr>
              <FormTr>
                <FormTh>부서</FormTh>
                <FormTd sx={{ pr: 3 }}>
                  <GrpCombo
                    value={sel?.grp_id || ''}
                    onChange={(e) => setSel({ ...sel, grp_id: e.target.value })}
                  />
                </FormTd>
              </FormTr>
            </tbody>
          </StyledFormTbl>
        </form>
      </Box>

      <StyledCardActions>
        <SettingBtn btnType='add' onClick={handleNewSave}>
          신규등록
        </SettingBtn>
        <SettingBtn btnType='edit' onClick={handleUpdate} disabled={!sel?.cam_seq}>
          수정
        </SettingBtn>
        <SettingBtn btnType='reset' onClick={handleReset}>
          초기화
        </SettingBtn>
        <SettingBtn btnType='delete' onClick={handleDelete} disabled={!sel?.cam_seq}>
          삭제
        </SettingBtn>
      </StyledCardActions>
      <DlgMap />
    </StyledCard>
  );
};
