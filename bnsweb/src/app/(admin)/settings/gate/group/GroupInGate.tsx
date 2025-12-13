import { IfTbGate } from '@/models/gate/tb_gate';
import { IfTbGroup } from '@/models/tb_group';
import useSWR from 'swr';

type Props = {
  gate: IfTbGate;
};

const GroupInGate = ({ gate }: Props) => {
  const { data: grpList } = useSWR<IfTbGroup[]>(
    gate?.gate_seq ? [`/api/group/groupingate?seq=${gate?.gate_seq}`] : null
  );
  return (
    <div className='group-in-gate-item flex flex-wrap gap-2'>
      {(grpList || []).map((item, idx) => (
        <span key={item.grp_seq} className='inline-block'>
          {item.grp_seq}.{item.grp_nm}
          {idx < (grpList || [])?.length - 1 ? <span className='blank'>,</span> : ''}
        </span>
      ))}
    </div>
  );
};

export default GroupInGate;
