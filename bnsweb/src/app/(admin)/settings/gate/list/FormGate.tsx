// @flow

import { CameraLabel } from '@/app/(admin)/comp/input/CameraLabel';
import { CdIdCombo } from '@/app/(admin)/comp/input/CdIdCombo';
import { EbrdLabel } from '@/app/(admin)/comp/input/EbrdLabel';
import { EmcallGrpLabel } from '@/app/(admin)/comp/input/EmcallGrpLabel';
import { GrpCombo } from '@/app/(admin)/comp/input/GrpCombo';
import { useDlgCamera } from '@/app/(admin)/comp/popup/DlgCamera';
import { useDlgCameraMulti } from '@/app/(admin)/comp/popup/DlgCameraMulti';
import { useConfirm } from '@/app/(admin)/comp/popup/DlgConfirm';
import { useDlgEbrdMulti } from '@/app/(admin)/comp/popup/DlgEbrdMulti';
import { useDlgEmcallGrpMulti } from '@/app/(admin)/comp/popup/DlgEmcallGrpMulti';
import { useDlgMap } from '@/app/(admin)/comp/popup/DlgMap';
import { FormBtn, FormTd, FormTh, FormTr } from '@/app/(admin)/comp/table/FormTbl';
import { SettingBtn } from '@/app/(admin)/settings/alm/SettingBtn';
import { formStyles } from '@/app/(admin)/settings/comp/commStyles';
import { SettingTitle } from '@/app/(admin)/settings/comp/SettingTitle';
import {
  StyledBox,
  StyledCard,
  StyledCardActions,
  StyledFormTbl,
} from '@/app/(admin)/settings/comp/StyledForm';
import { useApiGateCamera } from '@/app/(admin)/settings/gate/list/useApiGateCamera';
import { useApiGateEbrd } from '@/app/(admin)/settings/gate/list/useApiGateEbrd';
import { useApiGateEmcallGrp } from '@/app/(admin)/settings/gate/list/useApiGateEmcallGrp';
import { IfTbGate, TbGate } from '@/models/gate/tb_gate';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
import { Box, IconButton, SvgIcon, TextField, Typography } from '@mui/material';
import axios from 'axios';
import { MouseEvent } from 'react';
import { toast } from 'sonner';
import { useSWRConfig } from 'swr';
import { handleDialogRejection } from '@/utils/dialog-utils';

type Props = {
  sel: IfTbGate;
  setSel: (v: IfTbGate) => void;
};

export const FormGate = ({ sel, setSel }: Props) => {
  const { mutate } = useSWRConfig();
  const [refCameraMulti, DlgCameraMulti] = useDlgCameraMulti();

  const handleReset = () => {
    setSel(new TbGate());
  };

  const { gateCameras, setGateCameras, saveCameras } = useApiGateCamera({
    gateSeq: sel.gate_seq,
  });
  const { gateEbrds, setGateEbrds, saveEbrds } = useApiGateEbrd({
    gateSeq: sel.gate_seq,
  });
  // const { gateEmcalls, setGateEmcalls, saveEmcalls } = useApiGateEmcall({
  //   gateSeq: sel.gate_seq,
  // });

  const { gateEmcallGrps, setGateEmcallGrps, saveEmcallGrps } = useApiGateEmcallGrp({
    gateSeq: sel.gate_seq,
  });

  const handleSave = (param: IfTbGate) => {
    if (['Hpsys', 'HpsysCrtn'].includes(param?.gate_type || '')) {
      if (!param?.gate_no) {
        toast.error('"설치 게이트 번호"를 입력하여 주십시오');
        return;
      }
      if (param?.gate_no < 1) {
        toast.error('"설치 게이트 번호"는 1 이상이어야 합니다');
        return;
      }
    } else {
      param.gate_no = null;
    }
    if (param?.down_type === 'Auto') {
      if (!param?.auto_down_cond) {
        toast.error('"자동 차단 조건"을 선택하여 주십시오');
        return;
      }
    } else {
      param.auto_down_cond = null;
    }
    axios
      .post('/api/gate/save', param)
      .then((res) => {
        setSel(res.data);
        const gateSeq = res.data.gate_seq;
        Promise.all([saveCameras({ gateSeq }), saveEbrds({ gateSeq }), saveEmcallGrps({ gateSeq })])
          .then(() => {
            toast.success('저장하였습니다');
            mutate(() => true);
          })
          .catch((e) => {
            console.error('E', e);
            toast.error('실패하였습니다.(error : ' + e?.message + ')');
          });
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
          .post('/api/gate/delete', sel)
          .then((res) => {
            console.log('res', res.data);
            toast.success('삭제 하였습니다');
            setSel(new TbGate());
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
    const pos = (n?: number) => (n && n < 20 ? undefined : n);
    dlgMap.current
      ?.show('차단장비 좌표 선택', { lat: pos(sel.gate_lat), lng: pos(sel.gate_lng) })
      .then((res) => {
        setSel({ ...sel, gate_lat: res.lat, gate_lng: res.lng });
        toast.info('선택 하였습니다');
      })
      .catch((rejection) => {
        handleDialogRejection(rejection);
      });
  };

  const [dlgMap, DlgMap] = useDlgMap();
  const [dlgCamera, DlgCamera] = useDlgCamera();
  //const [dlgEmcallMulti, DlgEmcallMulti] = useDlgEmcallMulti();
  const [dlgEmcallGrpMulti, DlgEmcallGrpMulti] = useDlgEmcallGrpMulti();
  const [dlgEbrdMulti, DlgEbrdMulti] = useDlgEbrdMulti();

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

  const handleClickSubCamera = (e: MouseEvent) => {
    e.preventDefault();
    refCameraMulti.current
      ?.show({ camSeqs: gateCameras.map((ele) => ele.cam_seq!) })
      .then((res) => {
        toast.info('카메라를 선택하였습니다');
        setGateCameras(
          (res.camSeqs || []).map((ele) => ({ gate_seq: sel.gate_seq, cam_seq: ele }))
        );
      })
      .catch((rejection) => {
        handleDialogRejection(rejection);
      });
  };

  // const handleEmcallClick = (e) => {
  //   e.preventDefault();
  //   dlgEmcallMulti.current
  //     ?.show({ emcallSeqs: gateEmcalls.map((ele) => ele.emcall_seq!) })
  //     .then((res) => {
  //       setGateEmcalls(
  //         (res.emcallSeqs || []).map((ele) => ({
  //           gate_seq: sel.gate_seq,
  //           emcall_seq: ele,
  //         }))
  //       );
  //     })
  //     .catch((rejection) => {
  //       if (rejection && rejection.cmd === 'close') {
  //         console.log('cancel || close');
  //       } else {
  //         console.error('error', rejection?.message);
  //       }
  //     });
  // };
  const handleEbrdClick = (e) => {
    e.preventDefault();
    dlgEbrdMulti.current
      ?.show({ ebrdSeqs: gateEbrds.map((ele) => ele.ebrd_seq!) })
      .then((res) => {
        setGateEbrds(
          (res.ebrdSeqs || []).map((ele) => ({ gate_seq: sel.gate_seq, ebrd_seq: ele }))
        );
      })
      .catch((rejection) => {
        handleDialogRejection(rejection);
      });
  };

  const handleEmcallGrpClick = (e) => {
    e.preventDefault();
    dlgEmcallGrpMulti.current
      ?.show({ emcallGrpSeqs: gateEmcallGrps.map((ele) => ele.emcall_grp_seq!) })
      .then((res) => {
        setGateEmcallGrps(
          (res.emcallGrpSeqs || []).map((ele) => ({
            gate_seq: sel.gate_seq,
            emcall_grp_seq: ele,
          }))
        );
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
            차단장비 설정
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            차단장비의 정보를 설정합니다.
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
                    value={sel?.gate_nm || ''}
                    onChange={(e) => setSel({ ...sel, gate_nm: e.target.value })}
                  />
                </FormTd>
              </FormTr>
              <FormTr>
                <FormTh>위도/경도</FormTh>
                <FormTd sx={{ pr: 3 }}>
                  <Box sx={{ display: 'flex', gap: 0 }}>
                    <TextField
                      fullWidth
                      size='small'
                      value={sel?.gate_lat || ''}
                      onClick={handleClickLatLng}
                      placeholder='지도에서 선택하세요'
                    />
                    <TextField
                      fullWidth
                      size='small'
                      value={sel?.gate_lng || ''}
                      onClick={handleClickLatLng}
                      placeholder='지도에서 선택하세요'
                    />
                  </Box>
                </FormTd>
              </FormTr>
              <FormTr>
                <FormTh>IP/Port</FormTh>
                <FormTd sx={{ pr: 3 }}>
                  <Box sx={{ display: 'flex', gap: 0 }}>
                    <TextField
                      sx={{ flex: '2 1 0' }}
                      value={sel?.gate_ip || ''}
                      onChange={(e) => setSel({ ...sel, gate_ip: e.target.value })}
                    />
                    <TextField
                      sx={{ flex: '1 1 0' }}
                      value={sel?.gate_port || ''}
                      onChange={(e) =>
                        setSel({
                          ...sel,
                          gate_port: parseInt(e.target.value)
                            ? parseInt(e.target.value)
                            : undefined,
                        })
                      }
                    />
                  </Box>
                </FormTd>
              </FormTr>
              <FormTr>
                <FormTh>차단장비 타입</FormTh>
                <FormTd sx={{ pr: 3 }}>
                  <CdIdCombo
                    value={sel?.gate_type || ''}
                    grp='GT'
                    onChange={(e) => setSel({ ...sel, gate_type: e.target.value as any })}
                  />
                </FormTd>
              </FormTr>
              {['Hpsys', 'HpsysCrtn'].includes(sel?.gate_type || '') && (
                <FormTr>
                  <FormTh>게이트 번호</FormTh>
                  <FormTd sx={{ pr: 3 }}>
                    <TextField
                      fullWidth
                      size='small'
                      value={sel?.gate_no || ''}
                      onChange={(e) =>
                        setSel({
                          ...sel,
                          gate_no: parseInt(e.target.value) ? parseInt(e.target.value) : undefined,
                        })
                      }
                    />
                  </FormTd>
                </FormTr>
              )}
              <FormTr>
                <FormTh>차단 방식</FormTh>
                <FormTd sx={{ pr: 3 }}>
                  <CdIdCombo
                    value={sel?.down_type || ''}
                    grp='GDT'
                    onChange={(e) => setSel({ ...sel, down_type: e.target.value as any })}
                  />
                </FormTd>
              </FormTr>
              {sel?.down_type === 'Auto' && (
                <FormTr>
                  <FormTh>자동 차단 조건</FormTh>
                  <FormTd sx={{ pr: 3 }}>
                    <CdIdCombo
                      value={sel?.auto_down_cond || ''}
                      without={['Unknown', 'Norm']}
                      grp='WS'
                      onChange={(e) => setSel({ ...sel, auto_down_cond: e.target.value as any })}
                    />
                  </FormTd>
                </FormTr>
              )}
              <FormTr>
                <FormTh>주 카메라</FormTh>
                <FormTd sx={{ pr: 3 }} className='flex'>
                  <FormBtn onClick={handleClickCamera}>
                    &nbsp;
                    <CameraLabel camSeq={sel?.cam_seq} label='주 카메라를 선택하세요' />
                  </FormBtn>
                  {sel?.cam_seq ? (
                    <>
                      <IconButton
                        aria-label='delete'
                        size='small'
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSel({ ...sel, cam_seq: null });
                        }}
                      >
                        <DeleteIcon fontSize='inherit' />
                      </IconButton>
                    </>
                  ) : undefined}
                </FormTd>
              </FormTr>
              <FormTr>
                <FormTh>보조 카메라</FormTh>
                <FormTd sx={{ pr: 3 }}>
                  <FormBtn onClick={handleClickSubCamera}>
                    {(gateCameras || []).length > 0 ? (
                      (gateCameras || []).map((ele) => (
                        <div key={ele.cam_seq}>
                          <CameraLabel camSeq={ele.cam_seq} label='보조 카메라를 선택하세요' />
                        </div>
                      ))
                    ) : (
                      <span style={formStyles.comboLabel}>
                        &nbsp;<em>보조 카메라를 선택하세요</em>
                      </span>
                    )}
                  </FormBtn>
                </FormTd>
              </FormTr>
              <FormTr>
                <FormTh>전광판</FormTh>
                <FormTd sx={{ pr: 3 }}>
                  <FormBtn onClick={handleEbrdClick}>
                    {(gateEbrds || []).length > 0 ? (
                      (gateEbrds || []).map((ele) => (
                        <div key={ele.ebrd_seq}>
                          <EbrdLabel ebrdSeq={ele.ebrd_seq} label='전광판을 선택하세요' />
                        </div>
                      ))
                    ) : (
                      <span style={formStyles.comboLabel}>
                        &nbsp;<em>전광판을 선택하세요</em>
                      </span>
                    )}
                  </FormBtn>
                </FormTd>
              </FormTr>
              <FormTr>
                <FormTh>전광판 연동모드</FormTh>
                <FormTd sx={{ pr: 3 }}>
                  <CdIdCombo
                    value={sel?.ebrd_oper_mode || ''}
                    grp='EbrdOperMode'
                    selectLabel='연동모드를 선택하세요'
                    onChange={(e) => setSel({ ...sel, ebrd_oper_mode: e.target.value as any })}
                  />
                </FormTd>
              </FormTr>
              {/* <FormTr>
                <FormTh>비상통화장치</FormTh>
                <FormTd sx={{ pr: 3 }}>
                  <FormBtn onClick={handleEmcallClick}>
                    {(gateEmcalls || []).length > 0 ? (
                      (gateEmcalls || []).map((ele) => (
                        <div key={ele.emcall_seq}>
                          <EmcallLabel
                            emcallSeq={ele.emcall_seq}
                            label='비상통화장치를 선택하세요'
                          />
                        </div>
                      ))
                    ) : (
                      <span style={formStyles.comboLabel}>
                        &nbsp;<em>비상통화장치를 선택하세요</em>
                      </span>
                    )}
                  </FormBtn>
                </FormTd>
              </FormTr> */}
              <FormTr>
                <FormTh>송출그룹</FormTh>
                <FormTd sx={{ pr: 3 }}>
                  <FormBtn onClick={handleEmcallGrpClick}>
                    {(gateEmcallGrps || []).length > 0 ? (
                      (gateEmcallGrps || []).map((ele) => (
                        <div key={ele.emcall_grp_seq}>
                          <EmcallGrpLabel
                            sx={{ pl: 1 }}
                            emcallGrpSeq={ele.emcall_grp_seq}
                            label='비상통화장치 송출그룹을 선택하세요'
                          />
                        </div>
                      ))
                    ) : (
                      <span style={formStyles.comboLabel}>
                        &nbsp;<em>비상통화장치 송출그룹을 선택하세요</em>
                      </span>
                    )}
                  </FormBtn>
                </FormTd>
              </FormTr>
              <FormTr>
                <FormTh>송출그룹 연동모드</FormTh>
                <FormTd sx={{ pr: 3 }}>
                  <CdIdCombo
                    value={sel?.emcall_oper_mode || ''}
                    grp='EmcallOperMode'
                    selectLabel='연동모드를 선택하세요'
                    onChange={(e) => setSel({ ...sel, emcall_oper_mode: e.target.value as any })}
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
        <SettingBtn btnType='add' onClick={() => handleSave({ ...sel, gate_seq: undefined })}>
          신규등록
        </SettingBtn>
        <SettingBtn btnType='edit' onClick={() => handleSave({ ...sel })} disabled={!sel?.gate_seq}>
          수정
        </SettingBtn>
        <SettingBtn btnType='reset' onClick={handleReset}>
          초기화
        </SettingBtn>
        <SettingBtn btnType='delete' onClick={handleDelete} disabled={!sel?.gate_seq}>
          삭제
        </SettingBtn>
      </StyledCardActions>
      <DlgMap />
      <DlgCamera />
      <DlgCameraMulti />
      {/* <DlgEmcallMulti /> */}
      <DlgEmcallGrpMulti />
      <DlgEbrdMulti />
    </StyledCard>
  );
};
