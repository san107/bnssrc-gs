// @flow
import { useDlgEbrdMsgEdit } from '@/app/(admin)/settings/ebrd/comp/DlgEbrdMsgEdit';
import { EbrdMsgRow } from '@/app/(admin)/settings/ebrd/detail/EbrdMsgRow';
import { useApiEbrdEmerMsgs } from '@/app/(admin)/settings/ebrd/detail/useApiEbrdEmerMsgs';
import { useApiEbrdMsgInfo } from '@/app/(admin)/settings/ebrd/detail/useApiEbrdMsgInfo';
import { IfTbEbrd } from '@/models/ebrd/tb_ebrd';
import { IfEbrdMsgInfo } from '@/models/ebrd/tb_ebrd_msg';
import { Box, styled, Typography } from '@mui/material';

type Props = {
  sel: IfTbEbrd;
};
export const EbrdListActive = ({ sel }: Props) => {
  const { list } = useApiEbrdMsgInfo(sel.ebrd_seq, true);

  const isEmer = sel?.ebrd_event === 'EMER_START';
  const { list: emerlist } = useApiEbrdEmerMsgs(sel.ebrd_seq, isEmer);

  const [dlgEbrdMsgEdit, DlgEbrdMsgEdit] = useDlgEbrdMsgEdit();
  const handleEbrdMsgModify = (ele: IfEbrdMsgInfo) => {
    dlgEbrdMsgEdit.current?.show({ ebrd_seq: sel.ebrd_seq, ebrd_msg_pos: ele.ebrd_msg_pos });
  };
  return (
    <Body>
      <Typography variant='h5' fontWeight={700} color='text.primary'>
        표출중인 메시지
      </Typography>
      <List>
        {isEmer &&
          emerlist
            .filter((ele) => ele.send_stat === 'Y')
            .map((ele) => (
              <EbrdMsgRow
                key={ele.ebrd_msg_seq}
                ebrd={sel}
                ele={ele}
                edit={() => handleEbrdMsgModify(ele)}
              />
            ))}
        {!isEmer &&
          list
            .filter((ele) => ele.emerg_yn !== 'Y' && ele.send_stat === 'Y')
            .map((ele) => (
              <EbrdMsgRow
                key={ele.ebrd_msg_seq}
                ebrd={sel}
                ele={ele}
                edit={() => handleEbrdMsgModify(ele)}
              />
            ))}
      </List>
      <DlgEbrdMsgEdit />
    </Body>
  );
};

const Body = styled(Box)`
  padding-top: 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const List = styled(Box)`
  display: flex;
  flex-direction: column;
`;
