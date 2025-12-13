// @flow
import { FormControl, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import * as React from 'react';
import { formStyles } from '@/app/(admin)/settings/comp/commStyles';
import { useGrpList } from '@/hooks/useGrpList';
type Props = {
  value: string | undefined;
  without?: string[];
  onChange: (event: SelectChangeEvent) => void;
};
export const GrpCombo = ({ value, onChange }: Props) => {
  const { data: list, isLoading } = useGrpList();
  if (isLoading) return null;
  return (
    <FormControl fullWidth size='small'>
      <Select value={value} onChange={onChange} fullWidth displayEmpty>
        <MenuItem value='' disabled>
          <span style={formStyles.selectLabel}>
            <em>부서를 선택하세요</em>
          </span>
        </MenuItem>
        {(list || []).map((ele) => (
          <MenuItem key={ele.grp_id} value={ele.grp_id}>
            <span style={formStyles.selectLabel}>
              {ele.grp_id} ({ele.grp_nm})
            </span>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
