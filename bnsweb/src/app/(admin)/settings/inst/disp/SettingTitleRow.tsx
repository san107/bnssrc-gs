// @flow
import { listStyles } from '@/app/(admin)/settings/comp/commStyles';
import { SettingTitle } from '@/app/(admin)/settings/comp/SettingTitle';
import { Box, SvgIcon, Typography } from '@mui/material';
import * as React from 'react';
type Props = {
  icon: React.ReactNode;
  title: string;
  desc: string;
};
export const SettingTitleRow = ({ icon, title, desc }: Props) => {
  return (
    <SettingTitle>
      <Box sx={listStyles.titleBox}>
        <SvgIcon fontSize='large'>{icon}</SvgIcon>
      </Box>
      <Box>
        <Typography variant='h5' fontWeight={700} color='text.primary'>
          {title}
        </Typography>
        <Typography variant='body2' color='text.secondary' sx={listStyles.titleText}>
          {desc}
        </Typography>
      </Box>
    </SettingTitle>
  );
};
