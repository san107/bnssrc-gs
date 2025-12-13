// @flow
import { useState, useEffect } from 'react';
import { useConfirm } from '@/app/(admin)/comp/popup/DlgConfirm';
import { FormStdTr } from '@/app/(admin)/ndms/comp/FormStdTr';
import { SettingBtn } from '@/app/(admin)/settings/alm/SettingBtn';
import { SettingTitle } from '@/app/(admin)/settings/comp/SettingTitle';
import { hasTcmFludWalKey, IfTcmFludWal, TcmFludWal } from '@/models/ndms/tcm_flud_wal';
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
  sel: IfTcmFludWal;
  setSel: (v: IfTcmFludWal) => void;
};

export const FormFludWal = ({ sel, setSel }: Props) => {
  const { mutate } = useSWRConfig();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isAdmcodeExists, setIsAdmcodeExists] = useState<boolean>(false);

  useEffect(() => {
    // DB에서 불러온 데이터인 경우
    if (sel?.flcode) {
      axios
        .get(`/api/flud_wal/one?flcode=${sel.flcode}&cd_dist_wal=${sel.cd_dist_wal}`)
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
  }, [sel?.flcode, sel?.cd_dist_wal]);

  const handleReset = () => {
    setSel(new TcmFludWal());
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
    if (sel?.cd_dist_wal === undefined || sel.cd_dist_wal === null) {
      newErrors.cd_dist_wal = '수위측정소순번을 입력해주세요.';
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

    // 신규등록인 경우에 PK(flcode, cd_dist_wal) 중복 체크
    if (action === 'add') {
      if (!param.nm_dist_wal) {
        toast.error('수위측정소명칭을 입력해주세요.');
        return;
      }
      axios
        .get(`/api/flud_wal/one?flcode=${param.flcode}&cd_dist_wal=${param.cd_dist_wal}`)
        .then((res) => {
          if (res.data) {
            setErrors({
              flcode: '이미 존재하는 데이터입니다. 침수지점코드와 수위측정소순번을 확인하세요.',
            });
            return;
          }
          saveFludWal(param);
        })
        .catch((e) => {
          console.error('E', e);
        });
    } else {
      // 수정인 경우 바로 저장
      saveFludWal(param);
    }
  };

  const saveFludWal = (param: IfTcmFludWal) => {
    if (!param.nm_dist_wal) {
      toast.error('수위측정소명칭을 입력해주세요.');
      return;
    }
    axios
      .post('/api/flud_wal/save', param)
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
          .post('/api/flud_wal/delete', sel)
          .then((res) => {
            console.log('res', res.data);
            toast.success('삭제 하였습니다');
            setSel(new TcmFludWal());
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
            수위측정소정보
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            선택된 수위측정소정보를 설정합니다.
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
                label='수위측정소순번'
                value={sel?.cd_dist_wal}
                onChange={(e) => {
                  setSel({ ...sel, cd_dist_wal: parseInt(e) || undefined });
                  if (errors.cd_dist_wal) setErrors({ ...errors, cd_dist_wal: '' });
                }}
                required
                error={errors.cd_dist_wal}
              />
              <FormStdTr
                label='수위측정소명칭'
                value={sel?.nm_dist_wal}
                onChange={(e) => setSel({ ...sel, nm_dist_wal: e })}
                required
                maxLength={100}
              />
              <FormStdTr
                label='수집유형'
                value={sel?.gb_wal}
                onChange={(e) => setSel({ ...sel, gb_wal: e })}
                maxLength={1}
              />
              <FormStdTr
                label='최종수집일시'
                value={sel?.last_colct_de}
                onChange={(e) => setSel({ ...sel, last_colct_de: e })}
                readonly
              />
              <FormStdTr
                label='최종수위'
                value={sel?.last_colct_wal}
                onChange={(e) => setSel({ ...sel, last_colct_wal: parseFloat(e) || undefined })}
                readonly
              />
              <FormStdTr
                label='위도'
                value={sel?.lat}
                onChange={(e) => setSel({ ...sel, lat: parseFloat(e) || undefined })}
              />
              <FormStdTr
                label='경도'
                value={sel?.lon}
                onChange={(e) => setSel({ ...sel, lon: parseFloat(e) || undefined })}
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
          disabled={!sel?.cd_dist_wal || !isAdmcodeExists}
        >
          수정
        </SettingBtn>
        <SettingBtn btnType='reset' onClick={handleReset}>
          초기화
        </SettingBtn>
        <SettingBtn
          btnType='delete'
          onClick={handleDelete}
          disabled={!hasTcmFludWalKey(sel) || !isAdmcodeExists}
        >
          삭제
        </SettingBtn>
      </StyledCardActions>
    </StyledCard>
  );
};
