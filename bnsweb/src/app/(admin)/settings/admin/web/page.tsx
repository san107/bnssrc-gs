'use client';
// @flow
import { useDlgMap } from '@/app/(admin)/comp/popup/DlgMap';
import { ColGrp } from '@/app/(admin)/comp/table/ColGrp';
import { FormTbl, FormTd, FormTh, FormTr } from '@/app/(admin)/comp/table/FormTbl';
import { SettingBtn } from '@/app/(admin)/settings/alm/SettingBtn';
import { SettingTitle } from '@/app/(admin)/settings/comp/SettingTitle';
import { StyledCard, StyledBox, StyledCardActions } from '@/app/(admin)/settings/comp/StyledForm';
import { useConfigStore } from '@/store/useConfigStore';
import { exportToXlsObjs } from '@/utils/xls-utils';
import TuneIcon from '@mui/icons-material/Tune';
import { Box, TextField, Typography, Paper, Alert } from '@mui/material';
import axios from 'axios';
import { toast } from 'sonner';
import useSWR, { useSWRConfig } from 'swr';
import { useMobile } from '@/hooks/useMobile';
import { IfSvrInfo } from '@/models/tb_config';
import { handleDialogRejection } from '@/utils/dialog-utils';

type Props = {};
const WebIndex = (_props: Props) => {
  const { config, setConfig } = useConfigStore();
  const { isMobile } = useMobile();
  const { mutate } = useSWRConfig();

  const handleReset = () => {
    axios.get('/api/config/one').then((res) => setConfig(res.data));
  };

  const handleXls = () => {
    axios.get('/api/config/one').then((res) => {
      const data = res.data;
      exportToXlsObjs(['grp_id', 'def_lat', 'def_lng', 'def_zoom'], [data], 'config');
    });
  };

  const handleSave = () => {
    axios
      .post('/api/config/save', config)
      .then((res) => {
        setConfig(res.data);
        toast.success('저장하였습니다');
        mutate(() => true);
      })
      .catch((e) => {
        console.error('E', e);
        toast.error('실패하였습니다.(error : ' + e?.message + ')');
      });
  };

  const handleClickLatLng = () => {
    const pos = (n?: number) => (n && n < 20 ? undefined : n); //잘못된 위경도인 겨우, undefined로 리턴함.
    dlgMap.current
      ?.show('기본 위경도 선택', {
        lat: pos(config.def_lat),
        lng: pos(config.def_lng),
        zoom: config.def_zoom,
      })
      .then((res) => {
        setConfig({
          ...config,
          def_lat: res.lat,
          def_lng: res.lng,
          def_zoom: res.zoom ?? config.def_zoom,
        });
        toast.info('선택 하였습니다');
      })
      // .catch((e) => {
      //   console.error('E', e);
      //   //toast.error("취소 하였습니다");
      // });
      .catch((rejection) => {
        handleDialogRejection(rejection);
      });
  };

  const [dlgMap, DlgMap] = useDlgMap();

  const { data: svrInfo } = useSWR<IfSvrInfo>(['/api/config/svr']);

  return (
    <StyledCard>
      <SettingTitle>
        <StyledBox>
          <TuneIcon fontSize='large' />
        </StyledBox>
        <Box>
          <Typography variant='h5' fontWeight={700} color='text.primary'>
            웹 설정
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            웹 GIS의 기본 설정을 관리합니다.
          </Typography>
        </Box>
      </SettingTitle>

      <Box sx={{ m: 3 }}>
        <Alert severity='info'>
          웹 GIS의 기본 위치와 표시 설정을 관리합니다. 설정된 값은 모든 사용자에게 동일하게
          적용됩니다.
        </Alert>
      </Box>

      <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: 'background.default' }}>
        <Typography variant='h6' gutterBottom fontWeight={600} sx={{ mb: 1 }}>
          버전정보
        </Typography>
        <Typography variant='body1' color='text.primary' sx={{ fontWeight: 700, mb: 1 }}>
          재난안전솔루션 플랫폼 v1.0
        </Typography>
        <Typography variant='body2' color='text.primary' sx={{ mb: 5 }}>
          LDMS(Local Disaster Management System) v1.0
        </Typography>
        <Typography variant='h6' gutterBottom fontWeight={600}>
          기본 위치 설정
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          웹 GIS가 처음 로드될 때 표시될 기본 위치를 설정합니다. 지도에서 직접 선택하거나 좌표를
          입력할 수 있습니다.
        </Typography>
        <Box sx={{ mt: 1, mb: 2 }}>
          <Typography variant='body2' color='text.secondary'>
            * 입력 필드를 클릭하면 지도 팝업이 나옵니다.
          </Typography>
        </Box>
        <Box sx={{ mt: 2 }}>
          <form>
            <FormTbl width={'100%'}>
              <ColGrp cols={isMobile ? [1, 2] : [1, 2, 1, 2, 1, 2]} />
              <tbody>
                {isMobile ? (
                  <>
                    <FormTr>
                      <FormTh>기본 위도</FormTh>
                      <FormTd>
                        <TextField
                          fullWidth
                          value={config.def_lat || ''}
                          onChange={() => {}}
                          onClick={handleClickLatLng}
                          placeholder='지도에서 선택하세요'
                        />
                      </FormTd>
                    </FormTr>
                    <FormTr>
                      <FormTh>기본 경도</FormTh>
                      <FormTd>
                        <TextField
                          fullWidth
                          value={config.def_lng || ''}
                          onChange={() => {}}
                          onClick={handleClickLatLng}
                          placeholder='지도에서 선택하세요'
                        />
                      </FormTd>
                    </FormTr>
                    <FormTr>
                      <FormTh>기본 줌</FormTh>
                      <FormTd>
                        <TextField
                          value={config.def_zoom || ''}
                          fullWidth
                          onChange={() => {}}
                          onClick={handleClickLatLng}
                          placeholder='지도에서 선택하세요'
                        />
                      </FormTd>
                    </FormTr>

                    <FormTr>
                      <FormTh>웹 빌드 버전</FormTh>
                      <FormTd>
                        <TextField
                          value={process.env.NEXT_PUBLIC_BUILD_TIME || ''}
                          fullWidth
                          disabled
                          onClick={() => null}
                        />
                      </FormTd>
                    </FormTr>
                    <FormTr>
                      <FormTh>서버 빌드 버전</FormTh>
                      <FormTd>
                        <TextField
                          value={
                            svrInfo?.build_time ? new Date(svrInfo.build_time).toLocaleString() : ''
                          }
                          fullWidth
                          disabled
                          onClick={() => null}
                        />
                      </FormTd>
                    </FormTr>
                  </>
                ) : (
                  <>
                    <FormTr>
                      <FormTh>기본 위도</FormTh>
                      <FormTd>
                        <TextField
                          fullWidth
                          value={config.def_lat || ''}
                          onChange={() => {}}
                          onClick={handleClickLatLng}
                          placeholder='지도에서 선택하세요'
                        />
                      </FormTd>
                      <FormTh>기본 경도</FormTh>
                      <FormTd>
                        <TextField
                          fullWidth
                          value={config.def_lng || ''}
                          onChange={() => {}}
                          onClick={handleClickLatLng}
                          placeholder='지도에서 선택하세요'
                        />
                      </FormTd>
                      <FormTh>기본 줌</FormTh>
                      <FormTd>
                        <TextField
                          value={config.def_zoom || ''}
                          fullWidth
                          onChange={() => {}}
                          onClick={handleClickLatLng}
                          placeholder='지도에서 선택하세요'
                        />
                      </FormTd>
                    </FormTr>
                    <FormTr>
                      <FormTh>웹 빌드 버전</FormTh>
                      <FormTd>
                        <TextField
                          value={process.env.NEXT_PUBLIC_BUILD_TIME || ''}
                          fullWidth
                          disabled
                          onClick={() => null}
                        />
                      </FormTd>
                      <FormTh>서버 빌드 버전</FormTh>
                      <FormTd>
                        <TextField
                          value={
                            svrInfo?.build_time ? new Date(svrInfo.build_time).toLocaleString() : ''
                          }
                          fullWidth
                          disabled
                          onClick={() => null}
                        />
                      </FormTd>
                    </FormTr>
                  </>
                )}
              </tbody>
            </FormTbl>
          </form>
        </Box>
      </Paper>

      <StyledCardActions sx={{ mt: 2 }}>
        <SettingBtn btnType='save' onClick={handleSave}>
          저장
        </SettingBtn>
        <SettingBtn btnType='reset' onClick={handleReset}>
          초기화
        </SettingBtn>
        <SettingBtn btnType='xls' onClick={handleXls}>
          다운로드
        </SettingBtn>
      </StyledCardActions>
      <DlgMap />
    </StyledCard>
  );
};

export default WebIndex;
