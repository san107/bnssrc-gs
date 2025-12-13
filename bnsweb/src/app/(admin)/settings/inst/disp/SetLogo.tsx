'use client';

import { useDlgFileUpload } from '@/app/(admin)/comp/popup/DlgFileUpload';
import { typoStyles } from '@/app/(admin)/settings/comp/commStyles';
import { SettingTitleRow } from '@/app/(admin)/settings/inst/disp/SettingTitleRow';
import { useIsMounted } from '@/hooks/useIsMounted';
import { useSysConf } from '@/store/useSysConf';
import ImageIcon from '@mui/icons-material/Image';
import { Alert, Box, Button, Typography } from '@mui/material';
import axios from 'axios';
import { handleDialogRejection } from '@/utils/dialog-utils';

export const SetLogo = () => {
  const isMounted = useIsMounted();
  const { sysConf, saveSysConf } = useSysConf();
  const [dlgFileUpload, DlgFileUpload] = useDlgFileUpload();

  const handleRemoveLoginLogo = () => {
    //saveSysConf({ ...sysConf, login_logo_file_seq: null });
    axios
      .post('/api/file/delete', {
        file_seq: sysConf.login_logo_file_seq,
      })
      .then((res) => {
        console.log('res is ', res);
        saveSysConf({ ...sysConf, login_logo_file_seq: undefined });
      });
  };

  const handleLoginLogoUpload = () => {
    dlgFileUpload.current
      ?.show({ fileSeq: sysConf.login_logo_file_seq })
      .then((res) => {
        console.log('res is ', res);
        const { fileSeq } = res;
        if (fileSeq) {
          saveSysConf({ ...sysConf, login_logo_file_seq: fileSeq });
        }
      })
      .catch((rejection) => {
        handleDialogRejection(rejection);
      });
  };

  const handleRemoveLogo = () => {
    //saveSysConf({ ...sysConf, logo_file_seq: null });
    axios
      .post('/api/file/delete', {
        file_seq: sysConf.logo_file_seq,
      })
      .then((res) => {
        console.log('res is ', res);
        saveSysConf({ ...sysConf, logo_file_seq: undefined });
      });
  };

  const handleLogoUpload = () => {
    dlgFileUpload.current
      ?.show({ fileSeq: sysConf.logo_file_seq })
      .then((res) => {
        console.log('res is ', res);
        const { fileSeq } = res;
        if (fileSeq) {
          saveSysConf({ ...sysConf, logo_file_seq: fileSeq });
        }
      })
      .catch((rejection) => {
        handleDialogRejection(rejection);
      });
  };

  if (!isMounted) return null;

  return (
    <>
      <SettingTitleRow
        icon={<ImageIcon />}
        title='로고 이미지 설정'
        desc='시스템에 사용되는 로고 이미지를 설정합니다.'
      />
      <Box sx={{ mt: 3, mb: 3 }}>
        <Alert severity='info'>로그인 화면과 메인 화면에 표시될 로고 이미지를 설정합니다.</Alert>
        <Box
          sx={{
            mt: 2,
            p: 2,
            bgcolor: '#FAFAFA',
            borderRadius: 1,
            border: '1px solid #EAEAEA',
          }}
        >
          <Typography
            variant='subtitle2'
            color='text.secondary'
            gutterBottom
            sx={{ fontWeight: 600 }}
          >
            권장 사항:
          </Typography>
          <Typography variant='subtitle2' color='text.secondary' sx={{ paddingLeft: '20px' }}>
            <ul style={{ listStyle: 'disc' }}>
              <li>로그인 화면 로고: 최소 200x100px, 투명 배경의 PNG 파일 권장</li>
              <li>메인 화면 로고: 최소 150x50px, 투명 배경의 PNG 파일 권장</li>
              <li>파일 크기는 2MB 이하 권장</li>
              <li>지원 형식: PNG, JPG, JPEG, GIF</li>
            </ul>
          </Typography>
        </Box>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 4,
          justifyContent: 'space-between',
          pt: 4,
        }}
      >
        {/* 로그인 화면 이미지 설정 */}
        <Box sx={{ flex: 1 }}>
          <Box sx={[typoStyles.subTitle, typoStyles.center]}>로그인 화면 로고 이미지</Box>
          <Typography variant='body2' color='text.secondary' align='center' sx={{ mb: 2 }}>
            기업 아이덴티티를 잘 표현할 수 있는 이미지
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
            {sysConf.login_logo_file_seq && (
              <Box
                sx={{
                  width: '100%',
                  height: 100,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  mb: 2,
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                  overflow: 'hidden',
                }}
              >
                <img
                  src={`/api/public/file/download?fileSeq=${sysConf.login_logo_file_seq}`}
                  alt='로그인 로고 미리보기'
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                  }}
                />
              </Box>
            )}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant='contained' onClick={() => handleLoginLogoUpload()}>
                이미지 업로드
              </Button>
              {sysConf.login_logo_file_seq && (
                <Button variant='outlined' color='error' onClick={() => handleRemoveLoginLogo()}>
                  이미지 제거
                </Button>
              )}
            </Box>
          </Box>
        </Box>
        <Box
          sx={{
            display: { xs: 'none', md: 'block' },
            width: '1px',
            bgcolor: 'divider',
            mx: 2,
          }}
        />
        {/* 메인 화면 이미지 설정 */}
        <Box sx={{ flex: 1 }}>
          <Box sx={[typoStyles.subTitle, typoStyles.center]}>메인 화면 로고 이미지</Box>
          <Typography variant='body2' color='text.secondary' align='center' sx={{ mb: 2 }}>
            간단하고 깔끔한 로고 이미지
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
            {sysConf.logo_file_seq && (
              <Box
                sx={{
                  width: '100%',
                  height: 100,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  mb: 2,
                  border: '1px solid #e0e0e0',
                  overflow: 'hidden',
                  borderRadius: 1,
                }}
              >
                <img
                  src={`/api/public/file/download?fileSeq=${sysConf.logo_file_seq}`}
                  alt='메인 로고 미리보기'
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                  }}
                />
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant='contained' onClick={() => handleLogoUpload()}>
                이미지 업로드
              </Button>
              {sysConf.logo_file_seq && (
                <Button variant='outlined' color='error' onClick={() => handleRemoveLogo()}>
                  이미지 제거
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      </Box>

      <DlgFileUpload />
    </>
  );
};
