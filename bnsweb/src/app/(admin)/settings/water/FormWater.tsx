import { CameraLabel } from '@/app/(admin)/comp/input/CameraLabel';
import { CdIdCombo } from '@/app/(admin)/comp/input/CdIdCombo';
import { CdIdLabel } from '@/app/(admin)/comp/input/CdIdLabel';
import { GateLabel } from '@/app/(admin)/comp/input/GateLabel';
import { GrpCombo } from '@/app/(admin)/comp/input/GrpCombo';
import { NumberField2 } from '@/app/(admin)/comp/input/NumberField';
import { WaterLabel } from '@/app/(admin)/comp/input/WaterLabel';
import { useDlgCamera } from '@/app/(admin)/comp/popup/DlgCamera';
import { useConfirm } from '@/app/(admin)/comp/popup/DlgConfirm';
import { useDlgGateMulti } from '@/app/(admin)/comp/popup/DlgGateMulti';
import { useDlgMap } from '@/app/(admin)/comp/popup/DlgMap';
import { useDlgWater } from '@/app/(admin)/comp/popup/DlgWater';
import { FormBtn, FormDelBtn, FormTd, FormTh, FormTr } from '@/app/(admin)/comp/table/FormTbl';
import { SettingBtn } from '@/app/(admin)/settings/alm/SettingBtn';
import { formStyles } from '@/app/(admin)/settings/comp/commStyles';
import { SettingTitle } from '@/app/(admin)/settings/comp/SettingTitle';
import {
  StyledBox,
  StyledCard,
  StyledCardActions,
  StyledFormTbl,
} from '@/app/(admin)/settings/comp/StyledForm';
import { useApiLnkWater } from '@/app/(admin)/settings/water/useApiLnkWaterSeq';
import {
  IfTbWater,
  TbWater,
  WaterDataFromHpTypes as WaterTypeFromHpData,
  WaterType,
} from '@/models/water/tb_water';
import { IfTbWaterGate } from '@/models/water/tb_water_gate';
import { eqSet } from '@/utils/math-utils';
import SettingsIcon from '@mui/icons-material/Settings';
import { Box, SvgIcon, TextField, Typography } from '@mui/material';
import axios from 'axios';
import { MouseEvent, useEffect, useState } from 'react';
import { toast } from 'sonner';
import useSWR, { useSWRConfig } from 'swr';
import { handleDialogRejection } from '@/utils/dialog-utils';
import { useDlgGate } from '@/app/(admin)/comp/popup/DlgGate';

type Props = {
  sel: IfTbWater;
  setSel: (v: IfTbWater) => void;
};

export const FormWater = ({ sel, setSel }: Props) => {
  const { mutate } = useSWRConfig();

  const handleReset = () => {
    setLocalWaterGates([]);
    setSel(new TbWater());
  };

  const { lnkWaterSeq, setLnkWaterSeq, saveLnkWater } = useApiLnkWater(sel.water_seq);

  const handleSave = (_sel: IfTbWater) => {
    const sel = { ..._sel };
    if (WaterTypeFromHpData.includes(sel?.water_type)) {
      if (!sel.water_gate_seq) {
        toast.error('수위계 차단장비를 선택하세요');
        return;
      }
    } else {
      sel.water_gate_seq = null;
    }
    // if (WaterOnoffTypes.includes(sel.water_type)) {
    //   sel.limit_crit = 1;
    //   sel.limit_alert = 1;
    //   sel.limit_warn = 1;
    //   sel.limit_attn = 1;
    // }
    if (
      (sel.limit_crit ?? 0) < (sel.limit_alert ?? 0) ||
      (sel.limit_alert ?? 0) < (sel.limit_warn ?? 0) ||
      (sel.limit_warn ?? 0) < (sel.limit_attn ?? 0)
    ) {
      toast.error('수위 정보가 잘못 입력 되었습니다.');
      return;
    }
    axios
      .post('/api/water/save', sel)
      .then((res) => {
        //console.log('save.... ', res);
        return saveLnkWater(res.data.water_seq).then(() => {
          return res;
        });
      })
      .then((res) => {
        setSel(res.data);
        const s1 = new Set((waterGates || []).map((ele) => ele.gate_seq!));
        const s2 = new Set(localWaterGates.map((ele) => ele.gate_seq!));

        const waterSeq = sel.water_seq ? sel.water_seq : res.data?.water_seq;
        const list = localWaterGates.map((ele) => ({ ...ele, water_seq: waterSeq }));
        if (!eqSet(s1, s2)) {
          axios
            .post('/api/water_gate/saves', { waterSeq, list })
            .then((res) => {
              console.log('ok', res.data);
              toast.success('저장하였습니다');
              mutate(() => true);
            })
            .catch((e) => {
              console.error('E', e);
              toast.error('실패하였습니다.(error : ' + e?.message + ')');
            });
        } else {
          toast.success('저장하였습니다');
          mutate(() => true);
        }
      })
      .catch((e) => {
        console.error('E', e);
        if (e?.response?.status === 400 && e?.response?.data?.error) {
          toast.error(e.response.data.error);
        } else {
          toast.error('실패하였습니다.(error : ' + e?.message + ')');
        }
      });
  };

  const confirm = useConfirm();
  const handleDelete = () => {
    confirm('확인', ['삭제하시겠습니까'])
      ?.then(() => {
        console.log('삭제 확인. ');
        axios
          .post('/api/water/delete', sel)
          .then((res) => {
            console.log('res', res.data);
            toast.success('삭제 하였습니다');
            setSel(new TbWater());
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
      ?.show('수위계 좌표 선택', { lat: pos(sel.water_lat), lng: pos(sel.water_lng) })
      .then((res) => {
        setSel({ ...sel, water_lat: res.lat, water_lng: res.lng });
        toast.info('선택 하였습니다');
      })
      .catch((rejection) => {
        handleDialogRejection(rejection);
      });
  };

  const [dlgMap, DlgMap] = useDlgMap();
  const [dlgCamera, DlgCamera] = useDlgCamera();
  const [dlgGateMulti, DlgGateMulti] = useDlgGateMulti();
  const [dlgGate, DlgGate] = useDlgGate();

  const { data: waterGates } = useSWR<IfTbWaterGate[]>(
    !!sel.water_seq && ['/api/water_gate/list', { waterSeq: sel.water_seq }]
  );
  const [localWaterGates, setLocalWaterGates] = useState<IfTbWaterGate[]>([]);

  useEffect(() => {
    setLocalWaterGates((waterGates || []).map((ele) => ({ ...ele })));
  }, [waterGates]);

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

  const handleClickGate = (e: MouseEvent) => {
    e.preventDefault();
    dlgGateMulti.current
      ?.show({ gateSeqs: localWaterGates.map((ele) => ele.gate_seq!) })
      .then((res) => {
        toast.info('차단장비를 선택하였습니다');
        setLocalWaterGates(
          (res.gateSeqs || []).map((ele) => ({ water_seq: sel.water_seq, gate_seq: ele }))
        );
      })
      .catch((rejection) => {
        handleDialogRejection(rejection);
      });
  };

  const [dlgWater, DlgWater] = useDlgWater();
  const handleClickLnkWater = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dlgWater.current
      ?.show({ self: sel.water_seq })
      .then((res) => {
        setLnkWaterSeq(res.waterSeq);
      })
      .catch((rejection) => {
        handleDialogRejection(rejection);
      });
  };
  const handleClickWaterGate = (e: MouseEvent) => {
    e.preventDefault();
    dlgGate.current
      ?.show()
      .then(({ gateSeq }) => {
        toast.info('차단장비를 선택하였습니다');
        // setLocalWaterGates(
        //   (res.gateSeqs || []).map((ele) => ({ water_seq: sel.water_seq, gate_seq: ele }))
        // );
        setSel({ ...sel, water_gate_seq: gateSeq });
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
            수위계 설정
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            수위계의 정보를 설정합니다.
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
                    value={sel?.water_nm || ''}
                    onChange={(e) => setSel({ ...sel, water_nm: e.target.value })}
                  />
                </FormTd>
              </FormTr>
              <FormTr>
                <FormTh>수위계 ID</FormTh>
                <FormTd sx={{ pr: 3 }}>
                  <TextField
                    fullWidth
                    size='small'
                    value={sel?.water_dev_id || ''}
                    onChange={(e) => setSel({ ...sel, water_dev_id: e.target.value })}
                  />
                </FormTd>
              </FormTr>
              <FormTr>
                <FormTh>위도/경도</FormTh>
                <FormTd sx={{ pr: 3 }}>
                  <Box sx={{ display: 'flex', gap: 0 }}>
                    <TextField
                      value={sel?.water_lat || ''}
                      onClick={handleClickLatLng}
                      placeholder='지도에서 선택하세요'
                    />
                    <TextField
                      value={sel?.water_lng || ''}
                      onClick={handleClickLatLng}
                      placeholder='지도에서 선택하세요'
                    />
                  </Box>
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
                <FormTh>연동 차단장비</FormTh>
                <FormTd sx={{ pr: 3 }}>
                  <FormBtn onClick={handleClickGate}>
                    {(localWaterGates || []).length > 0 ? (
                      localWaterGates.map((ele) => (
                        <Box key={ele.gate_seq}>
                          <GateLabel gateSeq={ele.gate_seq} />
                        </Box>
                      ))
                    ) : (
                      <span style={formStyles.comboLabel}>
                        &nbsp;<em>차단장비를 선택하세요</em>
                      </span>
                    )}
                  </FormBtn>
                </FormTd>
              </FormTr>
              <FormTr>
                <FormTh>수위계 타입</FormTh>
                <FormTd sx={{ pr: 3 }}>
                  <CdIdCombo
                    value={sel?.water_type || ''}
                    grp='WT'
                    onChange={(e) => setSel({ ...sel, water_type: e.target.value as WaterType })}
                  />
                </FormTd>
              </FormTr>
              {WaterTypeFromHpData.includes(sel?.water_type) && (
                <FormTr>
                  <FormTh>수위계 차단장비</FormTh>
                  <FormTd>
                    <FormBtn onClick={handleClickWaterGate} className='flex items-center pl-1'>
                      <Box className='flex-grow'>
                        <GateLabel gateSeq={sel?.water_gate_seq} label='차단장비를 선택하세요' />
                      </Box>
                      {sel?.water_gate_seq ? (
                        <FormDelBtn onClick={() => setSel({ ...sel, water_gate_seq: undefined })} />
                      ) : undefined}
                    </FormBtn>
                  </FormTd>
                </FormTr>
              )}
              <FormTr>
                <FormTh>동작모드</FormTh>
                <FormTd sx={{ pr: 3 }}>
                  <CdIdCombo
                    value={sel?.water_mod || ''}
                    grp='WMOD'
                    onChange={(e) => setSel({ ...sel, water_mod: e.target.value })}
                  />
                </FormTd>
              </FormTr>
              <FormTr>
                <FormTh>연결 수위계</FormTh>
                <FormTd sx={{ pr: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <FormBtn onClick={handleClickLnkWater}>
                      &nbsp;
                      <WaterLabel style={true} waterSeq={lnkWaterSeq} label='수위계를 선택하세요' />
                    </FormBtn>
                    {lnkWaterSeq ? (
                      <FormDelBtn onClick={() => setLnkWaterSeq(undefined)} />
                    ) : undefined}
                  </Box>
                </FormTd>
              </FormTr>
              <FormTr>
                <FormTh>수위계 상태</FormTh>
                <FormTd sx={{ pr: 3 }}>
                  <Box sx={{ lineHeight: '35px' }}>
                    &nbsp;
                    <CdIdLabel grp='WS' id={sel?.water_stat} />
                  </Box>
                </FormTd>
              </FormTr>
              <FormTr>
                <FormTh>관심수위</FormTh>
                <FormTd sx={{ pr: 3, display: 'flex', alignItems: 'center' }}>
                  <NumberField2
                    sx={{ width: 90 }}
                    value={sel?.limit_attn}
                    onChange={(e) => setSel({ ...sel, limit_attn: e })}
                  />
                  &nbsp;m
                </FormTd>
              </FormTr>
              <FormTr>
                <FormTh>주의수위</FormTh>
                <FormTd sx={{ pr: 3, display: 'flex', alignItems: 'center' }}>
                  <NumberField2
                    sx={{ width: 90 }}
                    value={sel?.limit_warn}
                    onChange={(e) => setSel({ ...sel, limit_warn: e })}
                  />
                  &nbsp;m
                </FormTd>
              </FormTr>
              <FormTr>
                <FormTh>경계수위</FormTh>
                <FormTd sx={{ pr: 3, display: 'flex', alignItems: 'center' }}>
                  <NumberField2
                    sx={{ width: 90 }}
                    value={sel?.limit_alert}
                    onChange={(e) => setSel({ ...sel, limit_alert: e })}
                  />
                  &nbsp;m
                </FormTd>
              </FormTr>
              <FormTr>
                <FormTh>심각수위</FormTh>
                <FormTd sx={{ pr: 3, display: 'flex', alignItems: 'center' }}>
                  <NumberField2
                    sx={{ width: 90 }}
                    value={sel?.limit_crit}
                    onChange={(e) => setSel({ ...sel, limit_crit: e })}
                  />
                  &nbsp;m
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
        <SettingBtn btnType='add' onClick={() => handleSave({ ...sel, water_seq: undefined })}>
          신규등록
        </SettingBtn>
        <SettingBtn
          btnType='edit'
          onClick={() => handleSave({ ...sel })}
          disabled={!sel?.water_seq}
        >
          수정
        </SettingBtn>
        <SettingBtn btnType='reset' onClick={handleReset}>
          초기화
        </SettingBtn>
        <SettingBtn btnType='delete' onClick={handleDelete} disabled={!sel?.water_seq}>
          삭제
        </SettingBtn>
      </StyledCardActions>
      <DlgMap />
      <DlgCamera />
      <DlgGateMulti />
      <DlgWater />
      <DlgGate />
    </StyledCard>
  );
};
