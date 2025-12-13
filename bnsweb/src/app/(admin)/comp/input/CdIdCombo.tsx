// @flow
import { IfTbCd } from '@/models/comm/tb_cd';
import { FormControl, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import * as React from 'react';
import useSWR from 'swr';
import { formStyles } from '@/app/(admin)/settings/comp/commStyles';
type Props = {
  grp: string | undefined;
  value: string | undefined;
  without?: string[];
  selectLabel?: string;
  viewAll?: boolean;
  onChange: (event: SelectChangeEvent) => void;
};
export const CdIdCombo = ({ grp, value, onChange, without, selectLabel, viewAll }: Props) => {
  const { data, isLoading } = useSWR<IfTbCd[]>(grp && ['/api/cd/list', { grp }]);
  if (isLoading) return null;
  return (
    <FormControl fullWidth size='small'>
      <Select value={value} onChange={onChange} fullWidth displayEmpty>
        {viewAll && (
          <MenuItem value='' sx={{ color: '#33489c', fontWeight: 'bold' }}>
            ::: 전체보기 :::
          </MenuItem>
        )}
        <MenuItem value='' disabled>
          <span style={formStyles.selectLabel}>
            <em>{selectLabel || '타입을 선택하세요'}</em>
          </span>
        </MenuItem>
        {(data || [])
          .filter((ele) => !without?.includes(ele.cd_id))
          .map((ele) => (
            <MenuItem key={ele.cd} value={ele.cd_id}>
              <span style={formStyles.selectLabel}>{ele.cd_nm}</span>
            </MenuItem>
          ))}
      </Select>
    </FormControl>
  );
};
