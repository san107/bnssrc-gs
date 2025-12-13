// @flow
import { IconBtnDelete } from '@/app/(admin)/comp/iconbtn/IconBtnDelete';
import { CameraLabel } from '@/app/(admin)/comp/input/CameraLabel';
import { CdIdCombo } from '@/app/(admin)/comp/input/CdIdCombo';
import { EmcallGrpLabel } from '@/app/(admin)/comp/input/EmcallGrpLabel';
import { GrpCombo } from '@/app/(admin)/comp/input/GrpCombo';
import { useDlgCamera } from '@/app/(admin)/comp/popup/DlgCamera';
import { useConfirm } from '@/app/(admin)/comp/popup/DlgConfirm';
import { useDlgEmcallGrp } from '@/app/(admin)/comp/popup/DlgEmcallGrp';
import { useDlgMap } from '@/app/(admin)/comp/popup/DlgMap';
import { FormBtn, FormTd, FormTh, FormTr } from '@/app/(admin)/comp/table/FormTbl';
import { SettingBtn } from '@/app/(admin)/settings/alm/SettingBtn';
import { SettingTitle } from '@/app/(admin)/settings/comp/SettingTitle';
import {
  StyledCard,
  StyledBox,
  StyledFormTbl,
  StyledCardActions,
} from '@/app/(admin)/settings/comp/StyledForm';
import { IfTbEmcall, TbEmcall } from '@/models/emcall/tb_emcall';
import SettingsIcon from '@mui/icons-material/Settings';
import { Box, SvgIcon, TextField, Typography } from '@mui/material';
import axios from 'axios';
import { toast } from 'sonner';
import { useSWRConfig } from 'swr';
import { handleDialogRejection } from '@/utils/dialog-utils';

type Props = {
  sel: IfTbEmcall;
  setSel: (v: IfTbEmcall) => void;
};

export const FormEmcall = ({ sel, setSel }: Props) => {
  const { mutate } = useSWRConfig();

  const handleReset = () => {
    setSel(new TbEmcall());
  };

  const handleNewSave = () => {
    const copySel = { ...sel };
    delete copySel.emcall_seq; // 일련번호 제거
    axios
      .post('/api/emcall/save', copySel)
      .then((res) => {
        setSel(res.data);
        toast.success('신규로 비상통화장치를 등록하였습니다');
        mutate(() => true);
      })
      .catch((e) => {
        console.error('E', e);
        toast.error('실패하였습니다.(error : ' + e?.message + ')');
      });
  };

  const handleUpdate = () => {
    axios
      .post('/api/emcall/save', sel)
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
          .post('/api/emcall/delete', sel)
          .then((res) => {
            console.log('res', res.data);
            toast.success('삭제 하였습니다');
            setSel(new TbEmcall());
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
      ?.show('비상통화장치 좌표 선택', { lat: pos(sel.emcall_lat), lng: pos(sel.emcall_lng) })
      .then((res) => {
        setSel({ ...sel, emcall_lat: res.lat, emcall_lng: res.lng });
        toast.info('선택 하였습니다');
      })
      .catch((rejection) => {
        handleDialogRejection(rejection);
      });
  };

  const [dlgMap, DlgMap] = useDlgMap();
  const [dlgCamera, DlgCamera] = useDlgCamera();
  const handleClickCamera = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dlgCamera.current
      ?.show({})
      .then((res) => {
        toast.info('카메라를 선택하였습니다');
        setSel({ ...sel, cam_seq: res.camSeq });
      })
      .catch((rejection) => {
        handleDialogRejection(rejection);
      });
  };

  const [dlgEmcallGrp, DlgEmcallGrp] = useDlgEmcallGrp();

  const handleClickEmcallGrp = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dlgEmcallGrp.current
      ?.show({})
      .then((res) => {
        setSel({ ...sel, emcall_grp_seq: res.emcallGrpSeq });
      })
      .catch((rejection) => {
        handleDialogRejection(rejection);
      });
  };

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
            {/* 비상통화장치 설정 */}
            비상벨 수신 설정
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            {/* 비상통화장치의 정보를 설정합니다. */}
            비상벨 수신 정보를 설정합니다.
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
                    value={sel?.emcall_nm || ''}
                    onChange={(e) => setSel({ ...sel, emcall_nm: e.target.value })}
                  />
                </FormTd>
              </FormTr>
              <FormTr>
                <FormTh>ID(매칭코드)</FormTh>
                <FormTd sx={{ pr: 3 }}>
                  <TextField
                    fullWidth
                    size='small'
                    value={sel?.emcall_id || ''}
                    onChange={(e) => setSel({ ...sel, emcall_id: e.target.value })}
                  />
                </FormTd>
              </FormTr>
              <FormTr>
                <FormTh>위도</FormTh>
                <FormTd sx={{ pr: 3 }}>
                  <TextField
                    fullWidth
                    size='small'
                    value={sel?.emcall_lat || ''}
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
                    value={sel?.emcall_lng || ''}
                    onClick={handleClickLatLng}
                    placeholder='지도에서 선택하세요'
                  />
                </FormTd>
              </FormTr>
              <FormTr>
                <FormTh>송출그룹</FormTh>
                <FormTd sx={{ pr: 3 }} className='flex'>
                  <FormBtn onClick={handleClickEmcallGrp}>
                    &nbsp;
                    <EmcallGrpLabel
                      emcallGrpSeq={sel?.emcall_grp_seq}
                      label='송출그룹을 선택하세요'
                    />
                  </FormBtn>
                  {sel?.emcall_grp_seq ? (
                    <IconBtnDelete onClick={() => setSel({ ...sel, emcall_grp_seq: undefined })} />
                  ) : undefined}
                </FormTd>
              </FormTr>
              <FormTr>
                <FormTh>카메라</FormTh>
                <FormTd sx={{ pr: 3 }} className='flex'>
                  <FormBtn onClick={handleClickCamera}>
                    &nbsp;
                    <CameraLabel camSeq={sel?.cam_seq} label='카메라를 선택하세요' />
                  </FormBtn>
                  {sel?.cam_seq ? (
                    <IconBtnDelete onClick={() => setSel({ ...sel, cam_seq: undefined })} />
                  ) : undefined}
                </FormTd>
              </FormTr>
              <FormTr>
                <FormTh>타입</FormTh>
                <FormTd sx={{ pr: 3 }}>
                  <CdIdCombo
                    value={sel?.emcall_type || ''}
                    grp='EmcallType'
                    onChange={(e) => setSel({ ...sel, emcall_type: e.target.value })}
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
        <SettingBtn btnType='edit' onClick={handleUpdate} disabled={!sel?.emcall_seq}>
          수정
        </SettingBtn>
        <SettingBtn btnType='reset' onClick={handleReset}>
          초기화
        </SettingBtn>
        <SettingBtn btnType='delete' onClick={handleDelete} disabled={!sel?.emcall_seq}>
          삭제
        </SettingBtn>
      </StyledCardActions>
      <DlgMap />
      <DlgCamera />
      <DlgEmcallGrp />
    </StyledCard>
  );
};
