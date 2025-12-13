// @flow
import { useConfirm } from '@/app/(admin)/comp/popup/DlgConfirm';
import { SettingBtn } from '@/app/(admin)/settings/alm/SettingBtn';
import { StyledCardActions } from '@/app/(admin)/settings/comp/StyledForm';
import { useDlgEbrdMsgEdit } from '@/app/(admin)/settings/ebrd/comp/DlgEbrdMsgEdit';
import { EbrdMsgRow } from '@/app/(admin)/settings/ebrd/detail/EbrdMsgRow';
import { useApiEbrdMsgPage } from '@/app/(admin)/settings/ebrd/detail/useApiEbrdMsgPage';
import { IfTbEbrd } from '@/models/ebrd/tb_ebrd';
import { IfEbrdMsgInfo } from '@/models/ebrd/tb_ebrd_msg';
import { Box, styled, Typography } from '@mui/material';
import axios from 'axios';
import { toast } from 'sonner';
import { useSWRConfig } from 'swr';

type Props = {
  sel: IfTbEbrd;
};
export const EbrdListSaved = ({ sel }: Props) => {
  const { list, page, hasMore, next, prev } = useApiEbrdMsgPage(sel.ebrd_seq);
  const confirm = useConfirm();
  const { mutate } = useSWRConfig();

  const handleDeleteAll = () => {
    confirm('전체 삭제', ['전체 메시지를 삭제하시겠습니까?'])?.then(({}) => {
      axios
        .post('/api/ebrd/ctrl/room_del_all', { ebrd_seq: sel.ebrd_seq })
        .then((res) => {
          console.log('res', res.data);
          toast.success('삭제 하였습니다');
          mutate(() => true);
        })
        .catch((e) => {
          console.error('E', e);
          toast.error('삭제 실패하였습니다(' + e?.message + ')');
        });
    });
  };

  const [dlgEbrdMsgEdit, DlgEbrdMsgEdit] = useDlgEbrdMsgEdit();
  const handleEbrdMsgModify = (ele: IfEbrdMsgInfo) => {
    dlgEbrdMsgEdit.current?.show({ ebrd_seq: sel.ebrd_seq, ebrd_msg_pos: ele.ebrd_msg_pos });
  };
  return (
    <Body>
      <Typography variant='h5' fontWeight={700} color='text.primary'>
        저장된 메시지
      </Typography>
      <List>
        {list.map((ele) => (
          <EbrdMsgRow
            key={ele.ebrd_msg_seq}
            ebrd={sel}
            ele={ele}
            edit={() => handleEbrdMsgModify(ele)}
          />
        ))}
      </List>
      <StyledCardActions sx={{ mt: 2 }}>
        <SettingBtn btnType='delete' onClick={handleDeleteAll} disabled={!sel?.ebrd_seq}>
          전체 메시지 삭제
        </SettingBtn>
        <SettingBtn btnType='prev' onClick={prev} disabled={!sel?.ebrd_seq || page === 1}>
          이전
        </SettingBtn>
        <SettingBtn btnType='next' onClick={next} disabled={!sel?.ebrd_seq || !hasMore}>
          다음
        </SettingBtn>
      </StyledCardActions>
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
