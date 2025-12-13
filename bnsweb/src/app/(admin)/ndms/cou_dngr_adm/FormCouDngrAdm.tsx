// @flow
import { useState, useEffect } from 'react';
import { useConfirm } from '@/app/(admin)/comp/popup/DlgConfirm';
import { FormStdTr } from '@/app/(admin)/ndms/comp/FormStdTr';
import { SettingBtn } from '@/app/(admin)/settings/alm/SettingBtn';
import { SettingTitle } from '@/app/(admin)/settings/comp/SettingTitle';
import { IfTcmCouDngrAdm, TcmCouDngrAdm } from '@/models/ndms/tcm_cou_dngr_adm';
import { dateutil } from '@/utils/date-util';
import TuneIcon from '@mui/icons-material/Tune';
import { Box, SvgIcon, Typography } from '@mui/material';
import axios from 'axios';
import { toast } from 'sonner';
import { useSWRConfig } from 'swr';
import {
  StyledCard,
  StyledBox,
  StyledFormTbl,
  StyledCardActions,
} from '@/app/(admin)/settings/comp/StyledForm';

type Props = {
  sel: IfTcmCouDngrAdm;
  setSel: (v: IfTcmCouDngrAdm) => void;
};

export const FormCouDngrAdm = ({ sel, setSel }: Props) => {
  const { mutate } = useSWRConfig();
  const [isAdmcodeExists, setIsAdmcodeExists] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 관리기관코드가 DB에 존재하는지 확인
  useEffect(() => {
    // DB에서 불러온 데이터인 경우
    if (sel?.admcode) {
      axios
        .get(`/api/cou_dngr_adm/one?admcode=${sel.admcode}`)
        .then((res) => {
          setIsAdmcodeExists(!!res.data);
        })
        .catch((e) => {
          console.error('E', e);
          setIsAdmcodeExists(false);
        });
    } else {
      setIsAdmcodeExists(false);
    }
  }, [sel?.admcode]);

  const handleReset = () => {
    setSel(new TcmCouDngrAdm());
    setErrors({});
  };

  const handleSave = (action: 'add' | 'edit') => {
    const newErrors: Record<string, string> = {};

    // 필수 필드 검증
    if (!sel?.admcode?.trim()) {
      newErrors.admcode = '관리기관코드를 입력해주세요.';
    } else if (sel.admcode.length !== 5) {
      newErrors.admcode = '관리기관코드는 5자리여야 합니다.';
    }
    if (!sel?.chpsnnm?.trim()) {
      newErrors.chpsnnm = '담당자명을 입력해주세요.';
    }
    if (!sel?.charge_dept?.trim()) {
      newErrors.charge_dept = '담당부서를 입력해주세요.';
    }
    if (!sel?.cttpc?.trim()) {
      newErrors.cttpc = '연락처를 입력해주세요.';
    }
    if (!sel?.use_yn?.trim()) {
      newErrors.use_yn = '사용여부를 입력해주세요. (Y 또는 N)';
    } else if (sel.use_yn.length !== 1) {
      newErrors.use_yn = '사용여부는 1자리여야 합니다.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    const param = { ...sel };
    if (!param.rgsde) {
      param.rgsde = dateutil.toSaveDate(new Date());
    }
    if (!param.updde) {
      param.updde = dateutil.toSaveDate(new Date());
    }

    // 신규등록인 경우에 관리기관코드(admcode) 중복 체크
    if (action === 'add') {
      axios
        .get(`/api/cou_dngr_adm/one?admcode=${param.admcode}`)
        .then((res) => {
          if (res.data) {
            setErrors({ admcode: '이미 존재하는 관리기관코드입니다.' });
            return;
          }
          saveCouDngrAdm(param);
        })
        .catch((e) => {
          console.error('E', e);
        });
    } else {
      // 수정인 경우 바로 저장
      saveCouDngrAdm(param);
    }
  };

  const saveCouDngrAdm = (param: IfTcmCouDngrAdm) => {
    axios
      .post('/api/cou_dngr_adm/save', param)
      .then((res) => {
        setSel(res.data);
        setErrors({});
        toast.success('저장하였습니다');
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
          .post('/api/cou_dngr_adm/delete', sel)
          .then((res) => {
            console.log('res', res.data);
            toast.success('삭제 하였습니다');
            setSel(new TcmCouDngrAdm());
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

  return (
    <StyledCard>
      <SettingTitle>
        <StyledBox>
          <SvgIcon fontSize='large'>
            <TuneIcon />
          </SvgIcon>
        </StyledBox>
        <Box>
          <Typography variant='h5' fontWeight={700} color='text.primary'>
            센싱정보 관리 기관정보
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            선택된 센싱정보 관리 기관정보를 설정합니다.
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
              <FormStdTr
                label='관리기관코드'
                value={sel?.admcode}
                onChange={(e) => {
                  setSel({ ...sel, admcode: e });
                  if (errors.admcode) setErrors({ ...errors, admcode: '' });
                }}
                required
                maxLength={5}
                error={errors.admcode}
              />
              <FormStdTr
                label='담당자명'
                value={sel?.chpsnnm}
                onChange={(e) => {
                  setSel({ ...sel, chpsnnm: e });
                  if (errors.chpsnnm) setErrors({ ...errors, chpsnnm: '' });
                }}
                required
                maxLength={100}
                error={errors.chpsnnm}
              />
              <FormStdTr
                label='담당부서'
                value={sel?.charge_dept}
                onChange={(e) => {
                  setSel({ ...sel, charge_dept: e });
                  if (errors.charge_dept) setErrors({ ...errors, charge_dept: '' });
                }}
                required
                maxLength={100}
                error={errors.charge_dept}
              />
              <FormStdTr
                label='연락처'
                value={sel?.cttpc}
                onChange={(e) => {
                  setSel({ ...sel, cttpc: e });
                  if (errors.cttpc) setErrors({ ...errors, cttpc: '' });
                }}
                required
                maxLength={20}
                error={errors.cttpc}
              />
              <FormStdTr
                label='비고'
                value={sel?.rm}
                onChange={(e) => setSel({ ...sel, rm: e })}
                maxLength={1000}
              />
              <FormStdTr
                label='사용여부 (Y/N)'
                value={sel?.use_yn}
                onChange={(e) => {
                  setSel({ ...sel, use_yn: e });
                  if (errors.use_yn) setErrors({ ...errors, use_yn: '' });
                }}
                required
                maxLength={1}
                error={errors.use_yn}
              />
            </tbody>
          </StyledFormTbl>
        </form>
      </Box>

      <StyledCardActions>
        <SettingBtn btnType='add' onClick={() => handleSave('add')}>
          신규등록
        </SettingBtn>
        <SettingBtn
          btnType='edit'
          onClick={() => handleSave('edit')}
          disabled={!sel?.rgsde || !isAdmcodeExists}
        >
          수정
        </SettingBtn>
        <SettingBtn btnType='reset' onClick={handleReset}>
          초기화
        </SettingBtn>
        <SettingBtn
          btnType='delete'
          onClick={handleDelete}
          disabled={!sel?.rgsde || !isAdmcodeExists}
        >
          삭제
        </SettingBtn>
      </StyledCardActions>
    </StyledCard>
  );
};
