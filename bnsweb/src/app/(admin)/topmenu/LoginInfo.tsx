// @flow
import { useLoginInfo } from '@/app/(admin)/leftmenu/useLoginInfo';
import { Logout } from '@mui/icons-material';
import { Box, IconButton } from '@mui/material';
import * as React from 'react';
type Props = {
  color?: string;
};
export const LoginInfo = (props: Props) => {
  const { login, logout } = useLoginInfo();
  return (
    <Box>
      <IconButton
        sx={{ color: props.color || '#fff', fontSize: '1em' }}
        onClick={(e) => {
          e.preventDefault();
          logout();
        }}
      >
        {login.user_id}
        &nbsp;
        <Logout />
      </IconButton>
    </Box>
  );
};
