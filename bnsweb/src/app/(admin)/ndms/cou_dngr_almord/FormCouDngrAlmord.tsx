// @flow
import { useState, useEffect } from 'react';
import { useConfirm } from '@/app/(admin)/comp/popup/DlgConfirm';
import { FormStdTr } from '@/app/(admin)/ndms/comp/FormStdTr';
import { SettingTitle } from '@/app/(admin)/settings/comp/SettingTitle';
import { IfTcmCouDngrAlmord, TcmCouDngrAlmord } from '@/models/ndms/tcm_cou_dngr_almord';
import { nstr } from '@/utils/num-utils';
import TuneIcon from '@mui/icons-material/Tune';
import {
  StyledCard,
  StyledBox,
  StyledFormTbl,
  StyledCardActions,
} from '@/app/(admin)/settings/comp/StyledForm';
import { SvgIcon, Typography, Box } from '@mui/material';
import { SettingBtn } from '@/app/(admin)/settings/alm/SettingBtn';
import axios from 'axios';
import { toast } from 'sonner';
import { useSWRConfig } from 'swr';
import { dateutil } from '@/utils/date-util';

type Props = {
  sel: IfTcmCouDngrAlmord;
  setSel: (v: IfTcmCouDngrAlmord) => void;
};

export const FormCouDngrAlmord = ({ sel, setSel }: Props) => {
  const { mutate } = useSWRConfig();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isAdmcodeExists, setIsAdmcodeExists] = useState<boolean>(false);

  useEffect(() => {
    // DB에서 불러온 데이터인 경우
    if (sel?.dscode) {
      axios
        .get(
          `/api/cou_dngr_almord/one?dscode=${sel.dscode}&cd_dist_obsv=${sel.cd_dist_obsv}&almcode=${sel.almcode}&almde=${sel.almde}&almgb=${sel.almgb}`
        )
        // .get(`/api/cou_dngr_almord/one?dscode=${sel.dscode}`)
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
  }, [sel?.dscode, sel?.cd_dist_obsv, sel?.almcode, sel?.almde, sel?.almgb]);

  const handleReset = () => {
    setSel(new TcmCouDngrAlmord());
    setErrors({});
  };

  const handleSave = (action: 'add' | 'edit') => {
    const newErrors: Record<string, string> = {};

    // 필수 필드 검증
    if (!sel?.dscode?.trim()) {
      newErrors.dscode = '시설물코드를 입력해주세요.';
    } else if (sel.dscode.length !== 10) {
      newErrors.dscode = '시설물코드는 10자리여야 합니다.';
    }
    if (sel?.cd_dist_obsv === undefined || sel.cd_dist_obsv === null) {
      newErrors.cd_dist_obsv = '계측기순번을 입력해주세요.';
    }
    if (!sel?.almcode?.trim()) {
      newErrors.almcode = '경보코드를 입력해주세요.';
    } else if (sel.almcode.length !== 2) {
      newErrors.almcode = '경보코드는 2자리여야 합니다.';
    }
    if (!sel?.almde?.trim()) {
      newErrors.almde = '경보발령일시를 입력해주세요.';
    } else if (sel.almde.length !== 14) {
      newErrors.almde = '경보발령일시는 14자리(년월일시분초)여야 합니다.';
    }
    if (!sel?.almgb?.trim()) {
      newErrors.almgb = '발령구분을 입력해주세요.';
    } else if (sel.almgb.length !== 1) {
      newErrors.almgb = '발령구분은 1자리여야 합니다.';
    }
    if (!sel?.admcode?.trim()) {
      newErrors.admcode = '관리기관코드를 입력해주세요.';
    } else if (sel.admcode.length !== 5) {
      newErrors.admcode = '관리기관코드는 5자리여야 합니다.';
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

    // 신규등록인 경우에 PK(dscode, cd_dist_obsv, almcode, almde, almgb) 중복 체크
    if (action === 'add') {
      axios
        .get(
          `/api/cou_dngr_almord/one?dscode=${param.dscode}&cd_dist_obsv=${param.cd_dist_obsv}&almcode=${param.almcode}&almde=${param.almde}&almgb=${param.almgb}`
        )
        .then((res) => {
          if (res.data) {
            setErrors({
              dscode:
                '이미 존재하는 데이터입니다. 시설물코드, 계측기순번, 경보코드, 경보발령일시, 발령구분을 확인하세요.',
            });
            return;
          }
          saveCouDngrAlmord(param);
        })
        .catch((e) => {
          console.error('E', e);
        });
    } else {
      // 수정인 경우 바로 저장
      saveCouDngrAlmord(param);
    }
  };

  const saveCouDngrAlmord = (param: IfTcmCouDngrAlmord) => {
    axios
      .post('/api/cou_dngr_almord/save', param)
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
          .post('/api/cou_dngr_almord/delete', sel)
          .then((res) => {
            console.log('res', res.data);
            toast.success('삭제 하였습니다');
            setSel(new TcmCouDngrAlmord());
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
            위험경보 발령정보
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            선택된 위험경보 발령정보를 설정합니다.
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
                label='시설물코드'
                value={sel?.dscode}
                onChange={(e) => {
                  setSel({ ...sel, dscode: e });
                  if (errors.dscode) setErrors({ ...errors, dscode: '' });
                }}
                required
                maxLength={10}
                error={errors.dscode}
              />
              <FormStdTr
                label='계측기순번'
                value={nstr(sel?.cd_dist_obsv)}
                onChange={(e) => {
                  setSel({ ...sel, cd_dist_obsv: parseInt(e) });
                  if (errors.cd_dist_obsv) setErrors({ ...errors, cd_dist_obsv: '' });
                }}
                required
                error={errors.cd_dist_obsv}
              />
              <FormStdTr
                label='경보코드'
                value={sel?.almcode}
                onChange={(e) => {
                  setSel({ ...sel, almcode: e });
                  if (errors.almcode) setErrors({ ...errors, almcode: '' });
                }}
                required
                maxLength={2}
                error={errors.almcode}
              />
              <FormStdTr
                label='경보발령일시'
                value={sel?.almde}
                onChange={(e) => {
                  setSel({ ...sel, almde: e });
                  if (errors.almde) setErrors({ ...errors, almde: '' });
                }}
                required
                maxLength={14}
                error={errors.almde}
              />
              <FormStdTr
                label='발령구분'
                value={sel?.almgb}
                onChange={(e) => {
                  setSel({ ...sel, almgb: e });
                  if (errors.almgb) setErrors({ ...errors, almgb: '' });
                }}
                required
                maxLength={1}
                error={errors.almgb}
              />
              <FormStdTr
                label='경보발령내용'
                value={sel?.almnote}
                onChange={(e) => setSel({ ...sel, almnote: e })}
                maxLength={1000}
              />
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
          disabled={!sel?.cd_dist_obsv || !isAdmcodeExists}
        >
          수정
        </SettingBtn>
        <SettingBtn btnType='reset' onClick={handleReset}>
          초기화
        </SettingBtn>
        <SettingBtn
          btnType='delete'
          onClick={handleDelete}
          disabled={!sel?.cd_dist_obsv || !isAdmcodeExists}
        >
          삭제
        </SettingBtn>
      </StyledCardActions>
    </StyledCard>
  );
};
