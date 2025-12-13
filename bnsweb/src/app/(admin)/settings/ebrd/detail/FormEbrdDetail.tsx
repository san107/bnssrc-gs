// @flow
import { SettingTitle } from '@/app/(admin)/settings/comp/SettingTitle';
import { StyledBox, StyledCard } from '@/app/(admin)/settings/comp/StyledForm';
import { EbrdInfoTbl } from '@/app/(admin)/settings/ebrd/comp/EbrdInfoTbl';
import { EbrdListActive } from '@/app/(admin)/settings/ebrd/detail/EbrdListActive';
import { EbrdListSaved } from '@/app/(admin)/settings/ebrd/detail/EbrdListSaved';
import { IfTbEbrd } from '@/models/ebrd/tb_ebrd';
import SettingsIcon from '@mui/icons-material/Settings';
import { Box, SvgIcon, Typography } from '@mui/material';
import useSWR from 'swr';

type Props = {
  sel: IfTbEbrd;
  setSel: (v: IfTbEbrd) => void;
};

export const FormEbrdDetail = ({ sel }: Props) => {
  const { data: cnt } = useSWR<{ tot: number; send: number }>(
    !!sel?.ebrd_seq && ['/api/ebrd_map_msg/cnt?ebrd_seq=' + sel.ebrd_seq]
  );
  return (
    <StyledCard sx={{ overflowX: 'auto' }}>
      <SettingTitle>
        <StyledBox>
          <SvgIcon fontSize='large'>
            <SettingsIcon />
          </SvgIcon>
        </StyledBox>
        <Box>
          <Typography variant='h5' fontWeight={700} color='text.primary'>
            전광판 상세
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            전광판의 상세 정보를 확인합니다.
          </Typography>
        </Box>
      </SettingTitle>

      <Box sx={{ mt: 3, flexGrow: 1, overflowY: 'auto', minWidth: 700 }}>
        <form>
          {(cnt?.send ?? 0) < (cnt?.tot ?? 0) && (
            <Box className=' text-red-500 font-bold text-2xl mb-2'>
              전송되지 않은 {(cnt?.tot ?? 0) - (cnt?.send ?? 0)} 개의 메시지가 있습니다. 전송버튼을
              눌러 전송하여 주십시오.
            </Box>
          )}
          <EbrdInfoTbl sel={sel} />
        </form>

        {sel?.ebrd_seq ? (
          <>
            <EbrdListActive sel={sel} />
            <EbrdListSaved sel={sel} />
          </>
        ) : (
          <Box sx={{ mt: 3, flexGrow: 1, overflowY: 'auto', minWidth: 700 }}>
            <Typography variant='h5' fontWeight={700} color='text.primary'>
              왼쪽 목록에서 전광판을 선택하세요
            </Typography>
          </Box>
        )}
      </Box>
    </StyledCard>
  );
};
