'use client';
import { useIsMounted } from '@/hooks/useIsMounted';
// @flow
import { FormControlLabel, Switch } from '@mui/material';
import * as React from 'react';
type Props = {
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  minWidth?: number | string;
};
export const FormSwitch = ({ checked, onChange, label, minWidth }: Props) => {
  const isMounted = useIsMounted();
  if (!isMounted) return null;
  return (
    <FormControlLabel
      sx={{ minWidth }}
      control={<Switch checked={checked || false} onChange={onChange} value={checked || false} />}
      label={label}
    />
  );
};
