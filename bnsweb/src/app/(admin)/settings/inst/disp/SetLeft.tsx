// @flow
import { listStyles } from '@/app/(admin)/settings/comp/commStyles';
import { SetLogo } from '@/app/(admin)/settings/inst/disp/SetLogo';
import { SetSysConf } from '@/app/(admin)/settings/inst/disp/SetSysConf';
import { Card } from '@mui/material';
import * as React from 'react';
type Props = {};
export const SetLeft = ({}: Props) => {
  return (
    <Card sx={listStyles.cardNone}>
      <SetLogo />
      <SetSysConf />
    </Card>
  );
};
