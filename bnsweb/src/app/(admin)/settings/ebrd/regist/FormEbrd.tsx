// @flow
import { CdIdCombo } from '@/app/(admin)/comp/input/CdIdCombo';
import { CmmnCb } from '@/app/(admin)/comp/input/CmmnCb';
import { CmmnNCb } from '@/app/(admin)/comp/input/CmmnNCb';
import { GrpCombo } from '@/app/(admin)/comp/input/GrpCombo';
import { useConfirm } from '@/app/(admin)/comp/popup/DlgConfirm';
import { useDlgMap } from '@/app/(admin)/comp/popup/DlgMap';
import { FormBtn, FormDelBtn, FormTd, FormTh, FormTr } from '@/app/(admin)/comp/table/FormTbl';
import { SettingBtn } from '@/app/(admin)/settings/alm/SettingBtn';
import { SelectD2 } from '@/app/(admin)/settings/comp/SelectD2';
import { SettingTitle } from '@/app/(admin)/settings/comp/SettingTitle';
import {
  StyledBox,
  StyledCard,
  StyledCardActions,
  StyledFormTbl,
} from '@/app/(admin)/settings/comp/StyledForm';
import { IfTbEbrd, TbEbrd } from '@/models/ebrd/tb_ebrd';
import { get_err_msg } from '@/utils/err-util';
import { hm } from '@/utils/time-util';
import SettingsIcon from '@mui/icons-material/Settings';
import { Box, Button, SvgIcon, TextField, Typography } from '@mui/material';
import axios from 'axios';
import { toast } from 'sonner';
import { useSWRConfig } from 'swr';
import SendIcon from '@mui/icons-material/Send';
import { handleDialogRejection } from '@/utils/dialog-utils';
import { CameraLabel } from '@/app/(admin)/comp/input/CameraLabel';
import { useDlgCamera } from '@/app/(admin)/comp/popup/DlgCamera';
import { MouseEvent } from 'react';

type Props = {
  sel: IfTbEbrd;
  setSel: (v: IfTbEbrd) => void;
  changed: boolean;
};

export const FormEbrd = ({ sel, setSel, changed }: Props) => {
  const { mutate } = useSWRConfig();

  const handleReset = () => {
    setSel(new TbEbrd());
  };

  const handleNewSave = () => {
    const copySel = { ...sel };
    delete copySel.ebrd_seq; // 일련번호 제거
    if ((copySel.ebrd_id || '').length !== 12) {
      toast.error('ID는 12자리로 입력하세요');
      return;
    }
    if (!copySel.ebrd_ip) {
      toast.error('IP를 입력하세요');
      return;
    }
    axios
      .post('/api/ebrd/save', copySel)
      .then((res) => {
        setSel(res.data);
        toast.success('신규로 전광판을 등록하였습니다');
        mutate(() => true);
      })
      .catch((e) => {
        console.error('E', e);
        toast.error('실패하였습니다.(error : ' + e?.message + ')');
      });
  };

  const handleUpdate = () => {
    if ((sel.ebrd_id || '').length !== 12) {
      toast.error('ID는 12자리로 입력하세요');
      return;
    }
    if (!sel.ebrd_ip) {
      toast.error('IP를 입력하세요');
      return;
    }

    axios
      .post('/api/ebrd/save', sel)
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
          .post('/api/ebrd/delete', sel)
          .then((res) => {
            console.log('res', res.data);
            toast.success('삭제 하였습니다');
            setSel(new TbEbrd());
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
      ?.show('전광판 좌표 선택', { lat: pos(sel.ebrd_lat), lng: pos(sel.ebrd_lng) })
      .then((res) => {
        setSel({ ...sel, ebrd_lat: res.lat, ebrd_lng: res.lng });
        toast.info('선택 하였습니다');
      })
      .catch((rejection) => {
        handleDialogRejection(rejection);
      });
  };

  const [dlgMap, DlgMap] = useDlgMap();

  const handleSend = () => {
    console.log('send');
    axios
      .post('/api/ebrd/ctrl/oper_night_time_by_seq', { ebrd_seq: sel.ebrd_seq })
      .then((res) => {
        console.log('res', res.data);
        toast.success('전송 하였습니다');
        mutate(() => true);
      })
      .catch((e) => {
        console.error('E', e);
        toast.error('실패하였습니다(' + get_err_msg(e) + ')');
        mutate(() => true);
      });
  };

  const handleClickCamera = (e: MouseEvent) => {
    e.preventDefault();
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

  const [dlgCamera, DlgCamera] = useDlgCamera();
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
            전광판 설정
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            전광판의 정보를 설정합니다.
          </Typography>
        </Box>
      </SettingTitle>

      <Box sx={{ mt: 3, flexGrow: 1, overflowY: 'auto' }}>
        <form>
          <StyledFormTbl width={'100%'} sx={{ '& tr': { height: '30px' } }}>
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
                    value={sel?.ebrd_nm || ''}
                    onChange={(e) => setSel({ ...sel, ebrd_nm: e.target.value })}
                  />
                </FormTd>
              </FormTr>
              <FormTr>
                <FormTh>ID</FormTh>
                <FormTd sx={{ pr: 3 }}>
                  <TextField
                    fullWidth
                    size='small'
                    value={sel?.ebrd_id || ''}
                    onChange={(e) => setSel({ ...sel, ebrd_id: e.target.value })}
                  />
                </FormTd>
              </FormTr>
              <FormTr>
                <FormTh>위도/경도</FormTh>
                <FormTd sx={{ pr: 3, display: 'flex', alignItems: 'center' }}>
                  <TextField
                    size='small'
                    value={sel?.ebrd_lat || ''}
                    onClick={handleClickLatLng}
                    placeholder='지도에서 선택하세요'
                    sx={{ flexGrow: 1 }}
                  />
                  <TextField
                    size='small'
                    value={sel?.ebrd_lng || ''}
                    onClick={handleClickLatLng}
                    placeholder='지도에서 선택하세요'
                    sx={{ flexGrow: 1 }}
                  />
                </FormTd>
              </FormTr>
              <FormTr>
                <FormTh>IP/Port</FormTh>
                <FormTd sx={{ pr: 3, display: 'flex', alignItems: 'center' }}>
                  <TextField
                    sx={{ flex: '2 1 0' }}
                    value={sel?.ebrd_ip || ''}
                    onChange={(e) => setSel({ ...sel, ebrd_ip: e.target.value })}
                  />
                  <TextField
                    sx={{ flex: '1 1 0' }}
                    value={sel?.ebrd_port || ''}
                    onChange={(e) =>
                      parseInt(e.target.value) &&
                      setSel({ ...sel, ebrd_port: parseInt(e.target.value) })
                    }
                  />
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
                    <>
                      <FormDelBtn onClick={() => setSel({ ...sel, cam_seq: undefined })} />
                    </>
                  ) : undefined}
                </FormTd>
              </FormTr>
              <FormTr>
                <FormTh>전광판 타입</FormTh>
                <FormTd sx={{ pr: 3 }}>
                  <CdIdCombo
                    value={sel?.ebrd_type || ''}
                    grp='EbrdType'
                    onChange={(e) => setSel({ ...sel, ebrd_type: e.target.value })}
                  />
                </FormTd>
              </FormTr>
              <FormTr>
                <FormTh>크기(가로 x 세로)</FormTh>
                <FormTd sx={{ pr: 3, display: 'flex', gap: 1, alignItems: 'center' }}>
                  <TextField
                    sx={{ flexGrow: 1 }}
                    value={sel?.ebrd_size_w || ''}
                    onChange={(e) => setSel({ ...sel, ebrd_size_w: parseInt(e.target.value) })}
                  />
                  X
                  <TextField
                    sx={{ flexGrow: 1 }}
                    value={sel?.ebrd_size_h || ''}
                    onChange={(e) => setSel({ ...sel, ebrd_size_h: parseInt(e.target.value) })}
                  />
                </FormTd>
              </FormTr>
              <FormTr>
                <FormTh>휘도 단계</FormTh>
                <FormTd
                  sx={{ flexWrap: 'wrap', pr: 3, display: 'flex', gap: 0, alignItems: 'center' }}
                >
                  <Box sx={{ padding: '0 10px' }}>주간</Box>
                  <CmmnNCb
                    sx={{ minWidth: '30px', flexGrow: 1 }}
                    list={Array(21)
                      .fill(0)
                      .map((e, idx) => ({ val: idx, disp: ('' + idx).padStart(2, '0') }))}
                    val={sel?.brght_day_lvl}
                    setVal={(v) => setSel({ ...sel, brght_day_lvl: v })}
                  />
                  <Box sx={{ padding: '0 10px' }}>야간</Box>
                  <CmmnNCb
                    sx={{ minWidth: '30px', flexGrow: 1 }}
                    list={Array(21)
                      .fill(0)
                      .map((e, idx) => ({ val: idx, disp: ('' + idx).padStart(2, '0') }))}
                    val={sel?.brght_night_lvl}
                    setVal={(v) => setSel({ ...sel, brght_night_lvl: v })}
                  />
                </FormTd>
              </FormTr>
              <FormTr>
                <FormTh>주간 시작 시간</FormTh>
                <FormTd sx={{ pr: 3, display: 'flex', alignItems: 'center' }}>
                  <SelectD2
                    sx={{ flexGrow: 1, minWidth: '3px' }}
                    start={0}
                    end={23}
                    val={hm.gethh(sel?.day_time_start)}
                    setVal={(v) =>
                      setSel({ ...sel, day_time_start: hm.sethh(sel?.day_time_start, v) })
                    }
                  />
                  <Box sx={{ padding: '0 10px' }}>시</Box>
                  <SelectD2
                    sx={{ flexGrow: 1, minWidth: '3px' }}
                    start={0}
                    end={59}
                    val={hm.getmm(sel?.day_time_start)}
                    setVal={(v) =>
                      setSel({ ...sel, day_time_start: hm.setmm(sel?.day_time_start, v) })
                    }
                  />
                  <Box sx={{ padding: '0 10px' }}>분</Box>
                </FormTd>
              </FormTr>
              <FormTr>
                <FormTh>주간 종료 시간</FormTh>
                <FormTd sx={{ pr: 3, display: 'flex', alignItems: 'center' }}>
                  <CmmnCb
                    sx={{ flexGrow: 1, minWidth: '3px' }}
                    list={Array(24)
                      .fill(0)
                      .map((e, idx) => ('' + idx).padStart(2, '0'))
                      .map((e) => ({ val: e, disp: e }))}
                    val={hm.gethh(sel?.day_time_end)}
                    setVal={(v) => setSel({ ...sel, day_time_end: hm.sethh(sel?.day_time_end, v) })}
                  />
                  <Box sx={{ padding: '0 10px' }}>시</Box>
                  <CmmnCb
                    sx={{ flexGrow: 1, minWidth: '3px' }}
                    list={Array(60)
                      .fill(0)
                      .map((e, idx) => ('' + idx).padStart(2, '0'))
                      .map((e) => ({ val: e, disp: e }))}
                    val={hm.getmm(sel?.day_time_end)}
                    setVal={(v) => setSel({ ...sel, day_time_end: hm.setmm(sel?.day_time_end, v) })}
                  />
                  <Box sx={{ padding: '0 10px' }}>분</Box>
                </FormTd>
              </FormTr>

              <FormTr>
                <FormTh>전광판 On 시간</FormTh>
                <FormTd sx={{ pr: 3, display: 'flex', alignItems: 'center' }}>
                  <CmmnCb
                    sx={{ flexGrow: 1, minWidth: '3px' }}
                    list={Array(24)
                      .fill(0)
                      .map((e, idx) => ('' + idx).padStart(2, '0'))
                      .map((e) => ({ val: e, disp: e }))}
                    val={hm.gethh(sel?.on_time_start)}
                    setVal={(v) =>
                      setSel({ ...sel, on_time_start: hm.sethh(sel?.on_time_start, v) })
                    }
                  />
                  <Box sx={{ padding: '0 10px' }}>시</Box>
                  <CmmnCb
                    sx={{ flexGrow: 1, minWidth: '3px' }}
                    list={Array(60)
                      .fill(0)
                      .map((e, idx) => ('' + idx).padStart(2, '0'))
                      .map((e) => ({ val: e, disp: e }))}
                    val={hm.getmm(sel?.on_time_start)}
                    setVal={(v) =>
                      setSel({ ...sel, on_time_start: hm.setmm(sel?.on_time_start, v) })
                    }
                  />
                  <Box sx={{ padding: '0 10px' }}>분</Box>
                </FormTd>
              </FormTr>
              <FormTr>
                <FormTh>전광판 Off 시간</FormTh>
                <FormTd sx={{ pr: 3, display: 'flex', alignItems: 'center' }}>
                  <CmmnCb
                    sx={{ flexGrow: 1, minWidth: '3px' }}
                    list={Array(24)
                      .fill(0)
                      .map((e, idx) => ('' + idx).padStart(2, '0'))
                      .map((e) => ({ val: e, disp: e }))}
                    val={hm.gethh(sel?.on_time_end)}
                    setVal={(v) => setSel({ ...sel, on_time_end: hm.sethh(sel?.on_time_end, v) })}
                  />
                  <Box sx={{ padding: '0 10px' }}>시</Box>
                  <CmmnCb
                    sx={{ flexGrow: 1, minWidth: '3px' }}
                    list={Array(60)
                      .fill(0)
                      .map((e, idx) => ('' + idx).padStart(2, '0'))
                      .map((e) => ({ val: e, disp: e }))}
                    val={hm.getmm(sel?.on_time_end)}
                    setVal={(v) => setSel({ ...sel, on_time_end: hm.setmm(sel?.on_time_end, v) })}
                  />
                  <Box sx={{ padding: '0 10px' }}>분</Box>
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
              <FormTr>
                <FormTh>전송여부</FormTh>
                <FormTd sx={{ pr: 3, color: sel?.send_yn === 'Y' ? 'green' : 'red' }}>
                  {sel?.ebrd_seq && <> {sel?.send_yn === 'Y' ? '전송' : '미전송'}</>}
                </FormTd>
              </FormTr>
              <FormTr>
                <FormTd colSpan={2}>
                  <Button
                    onClick={handleSend}
                    disabled={!sel?.ebrd_seq || changed}
                    variant='outlined'
                    color='primary'
                  >
                    전광판으로 전송 &nbsp;
                    <SendIcon />
                  </Button>
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
        <SettingBtn btnType='edit' onClick={handleUpdate} disabled={!sel?.ebrd_seq}>
          수정
        </SettingBtn>
        <SettingBtn btnType='reset' onClick={handleReset}>
          초기화
        </SettingBtn>
        <SettingBtn btnType='delete' onClick={handleDelete} disabled={!sel?.ebrd_seq}>
          삭제
        </SettingBtn>
      </StyledCardActions>
      <DlgMap />
      <DlgCamera />
    </StyledCard>
  );
};
