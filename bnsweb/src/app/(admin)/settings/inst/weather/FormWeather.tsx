import { useConfirm } from '@/app/(admin)/comp/popup/DlgConfirm';
import { useDlgMap } from '@/app/(admin)/comp/popup/DlgMap';
import { FormPosTr } from '@/app/(admin)/ndms/comp/FormPosTr';
import { FormStdTr } from '@/app/(admin)/ndms/comp/FormStdTr';
import { SettingBtn } from '@/app/(admin)/settings/alm/SettingBtn';
import { SettingTitle } from '@/app/(admin)/settings/comp/SettingTitle';
import {
  StyledBox,
  StyledCard,
  StyledCardActions,
  StyledFormTbl,
} from '@/app/(admin)/settings/comp/StyledForm';
import { IfTbWeather, TbWeather } from '@/models/tb_weather';
import SettingsIcon from '@mui/icons-material/Settings';
import { Box, SvgIcon, Typography } from '@mui/material';
import axios from 'axios';
import { toast } from 'sonner';
import { useSWRConfig } from 'swr';
import { handleDialogRejection } from '@/utils/dialog-utils';

type Props = {
  sel: IfTbWeather;
  setSel: (v: IfTbWeather) => void;
};

export const FormWeather = ({ sel, setSel }: Props) => {
  const { mutate } = useSWRConfig();
  const confirm = useConfirm();

  const handleReset = () => {
    setSel(new TbWeather());
  };

  const handleSave = (sel: IfTbWeather) => {
    const param = { ...sel };

    axios
      .post('/api/weather/save', param)
      .then((res) => {
        setSel(res.data);
        toast.success('저장하였습니다');
        mutate(() => true);
      })
      .catch((e) => {
        console.error('E', e);
        toast.error('실패하였습니다.(error : ' + e?.message + ')');
      });
  };

  const handleDelete = () => {
    confirm('확인', ['삭제하시겠습니까'])
      ?.then(() => {
        console.log('삭제 확인. ');
        axios
          .post('/api/weather/delete', sel)
          .then((res) => {
            console.log('res', res.data);
            toast.success('삭제 하였습니다');
            setSel(new TbWeather());
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
      ?.show('날씨 지역 좌표 선택', { lat: pos(sel.wt_lat), lng: pos(sel.wt_lng) })
      .then((res) => {
        setSel({ ...sel, wt_lat: res.lat, wt_lng: res.lng });
        toast.info('선택 하였습니다');
      })
      .catch((rejection) => {
        handleDialogRejection(rejection);
      });
  };

  const [dlgMap, DlgMap] = useDlgMap();

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
            날씨 지역 설정
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            날씨 지역을 정보를 설정합니다.
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
                label='지역명'
                value={sel?.wt_rgn_nm}
                onPaste={(e) => {
                  const text = e.clipboardData.getData('text');
                  if (text?.length > 0 && text?.split(',').length === 3) {
                    setTimeout(() => {
                      const [rgn_nm, lat, lng] = text.split(',');
                      setSel({
                        ...sel,
                        wt_lat: parseFloat(lat),
                        wt_lng: parseFloat(lng),
                        wt_rgn_nm: rgn_nm,
                      });
                    }, 200);
                  }
                }}
                onChange={(e) => setSel({ ...sel, wt_rgn_nm: e })}
              />
              <FormPosTr
                value={sel?.wt_lat}
                onClick={handleClickLatLng}
                label='위도'
                placeholder='지도에서 선택하세요'
              />
              <FormPosTr
                value={sel?.wt_lng}
                onClick={handleClickLatLng}
                label='경도'
                placeholder='지도에서 선택하세요'
              />
            </tbody>
          </StyledFormTbl>
        </form>
      </Box>

      <StyledCardActions>
        <SettingBtn btnType='add' onClick={() => handleSave({ ...sel, wt_seq: undefined })}>
          신규등록
        </SettingBtn>
        <SettingBtn btnType='edit' onClick={() => handleSave({ ...sel })} disabled={!sel?.wt_seq}>
          수정
        </SettingBtn>
        <SettingBtn btnType='reset' onClick={handleReset}>
          초기화
        </SettingBtn>
        <SettingBtn btnType='delete' onClick={handleDelete} disabled={!sel?.wt_seq}>
          삭제
        </SettingBtn>
      </StyledCardActions>
      <DlgMap />
    </StyledCard>
  );
};
