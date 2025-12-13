'use client';
// @flow
import { SettingPaths } from '@/app/(admin)/settings/SettingsMenu';
import { SvgIconComponent } from '@mui/icons-material';
import { SvgIcon, Tab, Typography } from '@mui/material';
import * as React from 'react';
import { IconType } from 'react-icons/lib';
type Props = {
  value: SettingPaths;
  label: string;
  mui: boolean;
  comp: SvgIconComponent | IconType;
};
export const SettingsMenuItem = ({ value, label, mui, comp: Comp, ...props }: Props) => {
  return (
    <Tab
      {...props}
      sx={{ minHeight: '48px', padding: '4px 8px' }}
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
