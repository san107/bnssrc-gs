// @flow
import { IfTbCd } from '@/models/comm/tb_cd';
import { MenuItem, Select, SelectChangeEvent } from '@mui/material';
import * as React from 'react';
import useSWR from 'swr';
type Props = {
  grp: string | undefined;
  value: string | undefined;
  onChange: (event: SelectChangeEvent) => void;
};
export const CdCombo = ({ grp, value, onChange }: Props) => {
  const { data, isLoading } = useSWR<IfTbCd[]>(grp && ['/api/cd/list', { grp }]);
  if (isLoading) return null;
  return (
    <Select value={value} onChange={onChange} fullWidth>
      {(data || []).map((ele) => (
        <MenuItem key={ele.cd} value={ele.cd}>
          {ele.cd_nm}
        </MenuItem>
      ))}
    </Select>
  );
};
