'use client';
import { CdIdLabel } from '@/app/(admin)/comp/input/CdIdLabel';
import { GrpLabel } from '@/app/(admin)/comp/input/GrpLabel';
import { ColGrp } from '@/app/(admin)/comp/table/ColGrp';
import { FormTd, FormTh, FormTr } from '@/app/(admin)/comp/table/FormTbl';
import { StyledFormTbl } from '@/app/(admin)/settings/comp/StyledForm';
import { IfTbEbrd } from '@/models/ebrd/tb_ebrd';
import { hm } from '@/utils/time-util';
import { Box } from '@mui/material';
type Props = {
  sel?: IfTbEbrd;
};
export const EbrdInfoTbl = ({ sel }: Props) => {
  return (
    <StyledFormTbl className='top-border' width={'100%'} sx={{ '& td, & th': { height: '30px' } }}>
      <ColGrp cols={[35, 65, 35, 65]} />
      <tbody>
        <FormTr>
          <FormTh>이름</FormTh>
          <FormTd sx={{ pr: 3, textAlign: 'left' }}>
            {sel?.ebrd_seq ? (
              <>
                {sel?.ebrd_nm} ({sel?.ebrd_seq})
              </>
            ) : (
              ''
            )}
          </FormTd>
          <FormTh>ID</FormTh>
          <FormTd sx={{ pr: 3, textAlign: 'left' }}>{sel?.ebrd_id}</FormTd>
        </FormTr>
        <FormTr>
          <FormTh>위도/경도</FormTh>
          <FormTd sx={{ pr: 3 }}>
            {sel?.ebrd_id && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {sel?.ebrd_lat} , {sel?.ebrd_lng}
              </Box>
            )}
          </FormTd>
          <FormTh>IP/Port</FormTh>
          <FormTd sx={{ pr: 3 }}>
            {sel?.ebrd_id && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {sel?.ebrd_ip} : {sel?.ebrd_port}
              </Box>
            )}
          </FormTd>
        </FormTr>

        <FormTr>
          <FormTh>크기(가로 x 세로)</FormTh>
          <FormTd sx={{ pr: 3 }}>
            {sel?.ebrd_id && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {sel?.ebrd_size_w}X{sel?.ebrd_size_h}
              </Box>
            )}
          </FormTd>
          <FormTh>휘도 단계</FormTh>
          <FormTd sx={{ pr: 3 }}>
            {sel?.ebrd_id && (
              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                <Box sx={{ padding: '0 10px 0 0 ' }}>주간</Box>
                {sel?.brght_day_lvl}
                <Box sx={{ padding: '0 10px' }}>야간</Box>
                {sel?.brght_night_lvl}
              </Box>
            )}
          </FormTd>
        </FormTr>
        <FormTr>
          <FormTh>주간 시작 시간</FormTh>
          <FormTd sx={{ pr: 3 }}>
            {sel?.ebrd_id && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {hm.gethh(sel?.day_time_start)}
                <Box sx={{ padding: '0 10px' }}>시</Box>
                {hm.getmm(sel?.day_time_start)}
                <Box sx={{ padding: '0 10px' }}>분</Box>
              </Box>
            )}
          </FormTd>
          <FormTh>주간 종료 시간</FormTh>
          <FormTd sx={{ pr: 3 }}>
            {sel?.ebrd_id && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {hm.gethh(sel?.day_time_end)}
                <Box sx={{ padding: '0 10px' }}>시</Box>
                {hm.getmm(sel?.day_time_end)}
                <Box sx={{ padding: '0 10px' }}>분</Box>
              </Box>
            )}
          </FormTd>
        </FormTr>

        <FormTr>
          <FormTh>전광판 On 시간</FormTh>
          <FormTd sx={{ pr: 3 }}>
            {sel?.ebrd_id && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {hm.gethh(sel?.on_time_start)}
                <Box sx={{ padding: '0 10px' }}>시</Box>
                {hm.getmm(sel?.on_time_start)}
                <Box sx={{ padding: '0 10px' }}>분</Box>
              </Box>
            )}
          </FormTd>
          <FormTh>전광판 Off 시간</FormTh>
          <FormTd sx={{ pr: 3 }}>
            {sel?.ebrd_id && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {hm.gethh(sel?.on_time_end)}
                <Box sx={{ padding: '0 10px' }}>시</Box>
                {hm.getmm(sel?.on_time_end)}
                <Box sx={{ padding: '0 10px' }}>분</Box>
              </Box>
            )}
          </FormTd>
        </FormTr>
        <FormTr>
          <FormTh>전광판 타입</FormTh>
          <FormTd sx={{ pr: 3, textAlign: 'left' }}>
            {sel?.ebrd_id && <CdIdLabel grp='EbrdType' id={sel?.ebrd_type || ''} />}
          </FormTd>
          <FormTh>부서</FormTh>
          <FormTd sx={{ pr: 3, textAlign: 'left' }}>
            <GrpLabel grpId={sel?.grp_id || ''} />
          </FormTd>
        </FormTr>
        <FormTr>
          <FormTh>이벤트</FormTh>
          <FormTd sx={{ pr: 3, textAlign: 'left' }}>
            {sel?.ebrd_event === 'EMER_START' ? '긴급' : ''}
          </FormTd>
          <FormTh>날씨 표출 정보</FormTh>
          <FormTd sx={{ pr: 3, textAlign: 'left' }}>{sel?.ebrd_weather_msg}</FormTd>
        </FormTr>
      </tbody>
    </StyledFormTbl>
  );
};
