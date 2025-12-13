'use client';

import { useConfirm } from '@/app/(admin)/comp/popup/DlgConfirm';
import { useDlgAlmUser } from '@/app/(admin)/settings/alm/DlgAlmUser';
import { SettingTitle } from '@/app/(admin)/settings/comp/SettingTitle';
import { IfTbAlmUser, TbAlmUser } from '@/models/tb_alm_user';
import { Edit } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import RestoreIcon from '@mui/icons-material/Restore';
import {
  Box,
  Button,
  Card,
  Paper,
  SvgIcon,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import axios from 'axios';
import clsx from 'clsx';
import { Dispatch, SetStateAction } from 'react';
import { toast } from 'sonner';
import { mutate } from 'swr';
import { listStyles } from '@/app/(admin)/settings/comp/commStyles';
import { StyledCardActions } from '@/app/(admin)/settings/comp/StyledForm';
import { SmsSender } from '@/app/(admin)/settings/alm/SmsSender';
import { handleDialogRejection } from '@/utils/dialog-utils';

type Props = {
  list: IfTbAlmUser[] | undefined;
  sel: IfTbAlmUser;
  setSel: Dispatch<SetStateAction<IfTbAlmUser>>;
};

export const AlmUserList = ({ list, sel, setSel }: Props) => {
  //const { mutate } = useSWRConfig();

  const [dlgAlmUser, DlgAlmUser] = useDlgAlmUser();

  const confirm = useConfirm();
  const handleDelete = () => {
    //
    confirm('삭제확인', ['삭제 하시겠습니까?'])
      ?.then((res) => {
        console.log('res is ', res);
        axios
          .post('/api/alm_user/delete', { alm_user_seq: sel.alm_user_seq })
          .then((res) => {
            console.log('delete res ', res.data);
            toast.success('삭제 하였습니다.');
            setSel(new TbAlmUser());
            mutate(() => true);
          })
          .catch((e) => {
            console.error('E', e);
            toast.error('실패 하였습니다.');
          });
      })
      .catch((e) => {
        console.error('E', e);
      });
  };

  return (
    <Card sx={listStyles.card}>
      <SettingTitle>
        <Box sx={listStyles.titleBox}>
          <SvgIcon fontSize='large'>
            <ContactPhoneIcon />
          </SvgIcon>
        </Box>
        <Box>
          <Typography variant='h5' fontWeight={700} color='text.primary'>
            경보 사용자 목록
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={listStyles.titleText}>
            등록된 경보 사용자의 정보를 보여줍니다.
          </Typography>
        </Box>
      </SettingTitle>

      <SmsSender />

      <TableContainer component={Paper} sx={listStyles.tableContainer} className='scroll-table'>
        <Table sx={{ minWidth: 400 }} stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>이름</TableCell>
              <TableCell>부서</TableCell>
              <TableCell>전화번호</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(list || []).map((row) => (
              <TableRow
                key={row.alm_user_seq}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                onClick={() => setSel(row)}
                className={clsx({ sel: sel.alm_user_seq === row.alm_user_seq })}
              >
                <TableCell>{row.alm_user_nm}</TableCell>
                <TableCell>{row.alm_user_dept}</TableCell>
                <TableCell>{row.alm_user_mobile}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <StyledCardActions>
        <Button
          color='primary'
          onClick={() =>
            dlgAlmUser.current
              ?.show()
              .then((res) => console.log('res', res))
              .catch((rejection) => {
                handleDialogRejection(rejection);
              })
          }
          startIcon={<AddIcon />}
          sx={listStyles.commButton}
        >
          등록
        </Button>
        <Button
          color='primary'
          disabled={!sel.alm_user_seq}
          onClick={() =>
            dlgAlmUser.current
              ?.show(sel.alm_user_seq)
              .then((res) => console.log('res', res))
              .catch((rejection) => {
                handleDialogRejection(rejection);
              })
          }
          startIcon={<Edit />}
          sx={listStyles.commButton}
        >
          수정
        </Button>
        <Button
          color='secondary'
          onClick={() => setSel(new TbAlmUser())}
          startIcon={<RestoreIcon />}
          sx={listStyles.commButton}
        >
          초기화
        </Button>
        <Button
          color='error'
          onClick={handleDelete}
          disabled={!sel.alm_user_seq}
          startIcon={<DeleteIcon />}
          sx={listStyles.commButton}
        >
          삭제
        </Button>
      </StyledCardActions>
      <DlgAlmUser />
    </Card>
  );
};
