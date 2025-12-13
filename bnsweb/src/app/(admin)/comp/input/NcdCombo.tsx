// @flow
import { IfTbNCd } from '@/models/comm/tb_ncd';
import { MenuItem, Select, SelectProps } from '@mui/material';
import useSWR from 'swr';
type Props = {
  grp: string;
  value: number | undefined | null;
  inlist?: number[];
  onChange: (id: number | undefined) => void;
};
export const NcdCombo = ({ grp, value, inlist, onChange, ...props }: Props & SelectProps) => {
  const { data, isLoading } = useSWR<IfTbNCd[]>(grp && ['/api/ncd/list', { grp }]);
  if (isLoading) return null;
  return (
    <Select value={value ?? ''} onChange={(e) => onChange(Number(e.target.value))} {...props}>
      {(data || [])
        .filter((ele) => (inlist ? inlist.includes(ele.ncd_id) : true))
        .map((ele) => (
          <MenuItem key={ele.ncd_id} value={ele.ncd_id}>
            {ele.ncd_nm}
          </MenuItem>
        ))}
    </Select>
  );
};
