// @flow
import * as React from 'react';
import { SettingTitle } from '@/app/(admin)/settings/comp/SettingTitle';
import { IfTbGrp } from '@/models/tb_grp';
import InsertLinkIcon from '@mui/icons-material/InsertLink';
import {
  Box,
  Card,
  Divider,
  Grid,
  ListItem,
  ListItemText,
  SvgIcon,
  Typography,
} from '@mui/material';
import useSWR from 'swr';
import { GiCctvCamera } from 'react-icons/gi';
import { BoomGate } from '@/app/icons/BoomGate';
import { LevelSlider } from '@/app/icons/LevelSlider';
import { StyledBox } from '@/app/(admin)/settings/comp/StyledForm';

type Props = {
  sel: IfTbGrp;
};

export const RelatedItems = ({ sel }: Props) => {
  const { data: camList } = useSWR(
    sel?.grp_id ? [`/api/camera/childlist?grpId=${sel?.grp_id}`] : undefined
  );
  const { data: gateList } = useSWR(
    sel?.grp_id ? [`/api/gate/childlist?grpId=${sel?.grp_id}`] : undefined
  );
  const { data: waterList } = useSWR(
    sel?.grp_id ? [`/api/water/childlist?grpId=${sel?.grp_id}`] : undefined
  );
  return (
    <Card
      sx={{
        height: '100%',
        padding: 2,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* <SettingTitle>
        <AccountTreeTwoToneIcon />
        &nbsp;
        <Typography variant='h6'>연관 항목</Typography>
      </SettingTitle> */}
      <SettingTitle>
        <StyledBox>
          <SvgIcon fontSize='large'>
            <InsertLinkIcon />
          </SvgIcon>
        </StyledBox>
        <Box>
          <Typography variant='h5' fontWeight={700} color='text.primary'>
            연관 항목
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            선택된 부서의 카메라, 차단장비, 수위계 목록을 보여줍니다.
          </Typography>
        </Box>
      </SettingTitle>

      <Box sx={{ height: '20px' }} />

      {/* <Grid container spacing={2} sx={{ height: '100%', overflow: 'auto' }}> */}
      <Grid container spacing={2} columns={{ xs: 1, md: 12, lg: 12 }}>
        <Grid size={{ xs: 1, md: 4, lg: 4 }}>
          <Typography sx={{ mb: 1 }} variant='h6' component='div'>
            <SvgIcon>
              <GiCctvCamera />
            </SvgIcon>
            &nbsp;&nbsp;카메라
          </Typography>
          {camList?.length === 0 && (
            <ListItem disablePadding>
              <ListItemText primary='등록된 카메라가 없습니다.' />
            </ListItem>
          )}
          <Divider />
          {(camList || []).map((row) => (
            <React.Fragment key={row?.cam_seq}>
              <ListItem disablePadding>
                •&nbsp;
                <ListItemText secondary={row?.cam_nm} />
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </Grid>
        <Grid size={{ xs: 1, md: 4, lg: 4 }}>
          <Typography sx={{ mb: 1 }} variant='h6' component='div'>
            <SvgIcon>
              <BoomGate />
            </SvgIcon>
            &nbsp;&nbsp;차단장비
          </Typography>
          {gateList?.length === 0 && (
            <ListItem disablePadding>
              <ListItemText primary='등록된 차단장비가 없습니다.' />
            </ListItem>
          )}
          <Divider />
          {(gateList || []).map((row) => (
            <React.Fragment key={row?.gate_seq}>
              <ListItem disablePadding>
                •&nbsp;
                <ListItemText secondary={row?.gate_nm} />
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </Grid>
        <Grid size={{ xs: 1, md: 4, lg: 4 }}>
          <Typography sx={{ mb: 1 }} variant='h6' component='div'>
            <SvgIcon>
              <LevelSlider />
            </SvgIcon>
            &nbsp;&nbsp;수위계
          </Typography>
          {waterList?.length === 0 && (
            <ListItem disablePadding>
              <ListItemText primary='등록된 수위계가 없습니다.' />
            </ListItem>
          )}
          <Divider />
          {(waterList || []).map((row) => (
            <React.Fragment key={row?.water_seq}>
              <ListItem disablePadding>
                •&nbsp;
                <ListItemText secondary={row?.water_nm} />
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </Grid>
      </Grid>
    </Card>
  );
};
