import { FormControl, MenuItem, Select } from '@mui/material';
import { IfTbGroup } from '@/models/tb_group';
import { formStyles } from '@/app/(admin)/settings/comp/commStyles';
import useSWR from 'swr';

type Props = {
  value: string;
  onChange: (value: string) => void;
  open?: boolean;
};

export const GateGrpCombo = ({ value, onChange, open }: Props) => {
  const { data: grpList, isLoading } = useSWR<IfTbGroup[]>(open && ['/api/group/list']);
  if (isLoading) return null;

  return (
    <FormControl fullWidth size='small'>
      <Select value={value || ''} onChange={(e) => onChange(e.target.value)} displayEmpty>
        <MenuItem value={''} sx={{ color: '#33489c', fontWeight: 'bold' }}>
          ::: 전체보기 :::
        </MenuItem>
        <MenuItem value={''} disabled>
          <span style={formStyles.selectLabel}>
            <em>차단장비그룹을 선택하세요</em>
          </span>
        </MenuItem>
        {(grpList || []).map((row) => (
          <MenuItem key={row.grp_seq} value={row.grp_seq}>
            <span style={formStyles.selectLabel}>{row.grp_nm}</span>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
