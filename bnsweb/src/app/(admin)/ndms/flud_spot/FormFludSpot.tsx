// @flow
import { useState, useEffect } from 'react';
import { useConfirm } from '@/app/(admin)/comp/popup/DlgConfirm';
import { FormStdTr } from '@/app/(admin)/ndms/comp/FormStdTr';
import { SettingBtn } from '@/app/(admin)/settings/alm/SettingBtn';
import { SettingTitle } from '@/app/(admin)/settings/comp/SettingTitle';
import { IfTcmFludSpot, TcmFludSpot } from '@/models/ndms/tcm_flud_spot';
import { dateutil } from '@/utils/date-util';
import { nstr } from '@/utils/num-utils';
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
  sel: IfTcmFludSpot;
  setSel: (v: IfTcmFludSpot) => void;
};

export const FormFludSpot = ({ sel, setSel }: Props) => {
  const { mutate } = useSWRConfig();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isAdmcodeExists, setIsAdmcodeExists] = useState<boolean>(false);

  useEffect(() => {
    // DB에서 불러온 데이터인 경우
    if (sel?.flcode) {
      axios
        .get(`/api/flud_spot/one?flcode=${sel.flcode}`)
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
  }, [sel?.flcode]);

  const handleReset = () => {
    setSel(new TcmFludSpot());
    setErrors({});
  };

  const handleSave = (action: 'add' | 'edit') => {
    const newErrors: Record<string, string> = {};

    // 필수 필드 검증
    if (!sel?.flcode?.trim()) {
      newErrors.flcode = '침수지점코드를 입력해주세요.';
    } else if (sel.flcode.length !== 10) {
      newErrors.flcode = '침수지점코드는 10자리여야 합니다.';
    }
    if (!sel?.flname?.trim()) {
      newErrors.flname = '침수지점명을 입력해주세요.';
    }
    if (!sel?.fladdr?.trim()) {
      newErrors.fladdr = '상세주소를 입력해주세요.';
    }
    if (!sel?.bdong_cd?.trim()) {
      newErrors.bdong_cd = '법정동코드를 입력해주세요.';
    } else if (sel.bdong_cd.length !== 10) {
      newErrors.bdong_cd = '법정동코드는 10자리여야 합니다.';
    }
    if (!sel?.admcode?.trim()) {
      newErrors.admcode = '관리기관코드를 입력해주세요.';
    } else if (sel.admcode.length !== 5) {
      newErrors.admcode = '관리기관코드는 5자리여야 합니다.';
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

    // 신규등록인 경우에 침수지점코드(flcode) 중복 체크
    if (action === 'add') {
      axios
        .get(`/api/flud_spot/one?flcode=${param.flcode}`)
        .then((res) => {
          if (res.data) {
            setErrors({ flcode: '이미 존재하는 침수지점코드입니다.' });
            return;
          }
          saveFludSpot(param);
        })
        .catch((e) => {
          console.error('E', e);
        });
    } else {
      // 수정인 경우 바로 저장
      saveFludSpot(param);
    }
  };

  const saveFludSpot = (param: IfTcmFludSpot) => {
    axios
      .post('/api/flud_spot/save', param)
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
          .post('/api/flud_spot/delete', sel)
          .then((res) => {
            console.log('res', res.data);
            toast.success('삭제 하였습니다');
            setSel(new TcmFludSpot());
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
            침수지점정보
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            선택된 침수지점정보를 설정합니다.
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
                label='침수지점코드'
                value={sel?.flcode}
                onChange={(e) => {
                  setSel({ ...sel, flcode: e });
                  if (errors.flcode) setErrors({ ...errors, flcode: '' });
                }}
                required
                maxLength={10}
                error={errors.flcode}
              />
              <FormStdTr
                label='침수지점명'
                value={sel?.flname}
                onChange={(e) => {
                  setSel({ ...sel, flname: e });
                  if (errors.flname) setErrors({ ...errors, flname: '' });
                }}
                required
                maxLength={100}
                error={errors.flname}
              />
              <FormStdTr
                label='상세주소'
                value={sel?.fladdr}
                onChange={(e) => {
                  setSel({ ...sel, fladdr: e });
                  if (errors.fladdr) setErrors({ ...errors, fladdr: '' });
                }}
                required
                maxLength={200}
                error={errors.fladdr}
              />
              <FormStdTr
                label='법정동코드'
                value={sel?.bdong_cd}
                onChange={(e) => {
                  setSel({ ...sel, bdong_cd: e });
                  if (errors.bdong_cd) setErrors({ ...errors, bdong_cd: '' });
                }}
                required
                maxLength={10}
                error={errors.bdong_cd}
              />
              <FormStdTr
                label='위도'
                value={nstr(sel?.lat)}
                onChange={(e) => setSel({ ...sel, lat: parseFloat(e) })}
              />
              <FormStdTr
                label='경도'
                value={nstr(sel?.lon)}
                onChange={(e) => setSel({ ...sel, lon: parseFloat(e) })}
              />
              <FormStdTr
                label='주의수위'
                value={nstr(sel?.advsry_wal)}
                onChange={(e) => setSel({ ...sel, advsry_wal: parseFloat(e) })}
              />
              <FormStdTr
                label='경보수위'
                value={nstr(sel?.alarm_wal)}
                onChange={(e) => setSel({ ...sel, alarm_wal: parseFloat(e) })}
              />
              <FormStdTr
                label='침수수위'
                value={nstr(sel?.flud_wal)}
                onChange={(e) => setSel({ ...sel, flud_wal: parseFloat(e) })}
              />
              <FormStdTr
                label='비고'
                value={sel?.rm}
                onChange={(e) => setSel({ ...sel, rm: e })}
                maxLength={1000}
              />
              <FormStdTr
                label='관리코드'
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
          disabled={!sel?.flcode || !isAdmcodeExists}
        >
          수정
        </SettingBtn>
        <SettingBtn btnType='reset' onClick={handleReset}>
          초기화
        </SettingBtn>
        <SettingBtn
          btnType='delete'
          onClick={handleDelete}
          disabled={!sel?.flcode || !isAdmcodeExists}
        >
          삭제
        </SettingBtn>
      </StyledCardActions>
    </StyledCard>
  );
};
