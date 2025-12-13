'use client';
// @flow
import { SvgIconComponent } from '@mui/icons-material';
import { SvgIcon, Tab, Typography } from '@mui/material';
import * as React from 'react';
import { IconType } from 'react-icons/lib';
type Props = {
  value: string;
  label: string;
  mui: boolean;
  comp: SvgIconComponent | IconType;
};
export const SubMenuItem = ({ value, label, mui, comp: Comp, ...props }: Props) => {
  return (
    <Tab
      {...props}
      sx={{ minHeight: '32px', padding: '5px 10px' }}
      label={
        <Typography variant='body1' sx={{ fontWeight: 'bold' }}>
          {mui ? (
            <Comp />
          ) : (
            <SvgIcon>
              <Comp />
            </SvgIcon>
          )}
          &nbsp; {label}
        </Typography>
      }
      value={value}
    />
  );
};
