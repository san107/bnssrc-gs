'use client';

/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import { useLoginInfo } from '@/app/(admin)/leftmenu/useLoginInfo';
import { useConfirm } from '@/app/(admin)/comp/popup/DlgConfirm';
import { IfTbGrpTree, TbGrpTree } from '@/models/tb_grp_tree';
import { useState } from 'react';
import useSWR from 'swr';
import { useSWRConfig } from 'swr';
import axios from 'axios';
import { toast } from 'sonner';

type Props = {
  open: boolean;
  onClose: () => void;
};

type LookupValues<Values> = Values[keyof Values];
const CLOSE_REASON = {
  BUTTON: 'closeButtonClick',
  BACKDROP: 'backdropClick',
  ESCAPE: 'escapeKeyDown',
};

type CloseReason = LookupValues<typeof CLOSE_REASON>;
const IGNORED_REASONS: CloseReason[] = [CLOSE_REASON.BACKDROP, CLOSE_REASON.ESCAPE];
type CloseHandler = (event: object, reason: CloseReason) => void;

export function DlgGrpTree({ open, onClose }: Props) {
  const { login } = useLoginInfo();
  const [sel, setSel] = useState<IfTbGrpTree | null>(null);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [mode, setMode] = useState<string>('');
  const { data: grpList } = useSWR(login?.grp_id ? [`/api/grp/list`] : undefined);
  const { data: grpTreeList } = useSWR<IfTbGrpTree[]>(['/api/grp_tree/list']);
  const { mutate } = useSWRConfig();

  const getGrpName = (grpId: string) => {
    const grp = grpList?.find((g: any) => g.grp_id === grpId);
    return grp ? grp.grp_nm : grpId;
  };

  const handleClickClose: CloseHandler = (_, reason) => {
    if (IGNORED_REASONS.includes(reason)) {
      return;
    }
    onClose();
  };

  const handleAdd = () => {
    setSel({
      parent_id: '',
      child_id: '',
      grp_depth: 0,
    });
    setIsEdit(true);
    setMode('등록');
  };

  const handleEdit = (data: IfTbGrpTree) => {
    setSel(data);
    setIsEdit(true);
    setMode('수정');
  };

  const handleSave = () => {
    axios
      .post('/api/grp_tree/save', sel)
      .then((res) => {
        setSel(res.data);
        toast.success('저장하였습니다');
        mutate(() => true);
        setIsEdit(false);
      })
      .catch((e) => {
        console.error('E', e);
        toast.error('실패하였습니다.(error : ' + e?.message + ')');
      });
  };

  const confirm = useConfirm();
  const handleDelete = (data: IfTbGrpTree) => {
    confirm('확인', ['삭제하시겠습니까'])
      ?.then(() => {
        // console.log('삭제 확인. ');
        axios
          .post('/api/grp_tree/delete', { parent_id: data?.parent_id, child_id: data?.child_id })
          .then((res) => {
            console.log('res', res.data);
            toast.success('삭제 하였습니다');
            setSel(new TbGrpTree());
            mutate(() => true);
            setIsEdit(false);
          })
          .catch((e) => {
            console.error('E', e);
            toast.error('실패하였습니다(' + e?.message + ')');
          });
      })
      .catch((e) => {
        // 취소
        console.log('취소. ', e);
      });
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClickClose}
        maxWidth='md'
        fullWidth
        closeAfterTransition={false}
      >
        <DialogTitle>
          <AccountTreeIcon /> 부서트리 관리
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TableContainer
              component={Paper}
              // sx={{ height: '1px', flexGrow: 1, overflowY: 'auto' }}
              css={css`
                & .sel {
                  background-color: #eef;
                }
                & tr {
                  cursor: pointer;
                }
              `}
            >
              <Table sx={{ width: '100%' }} stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>상위 부서</TableCell>
                    <TableCell>하위 부서</TableCell>
                    <TableCell align='center'>Depth</TableCell>
                    <TableCell align='right'>
                      <Button onClick={handleAdd} color='primary' variant='outlined'>
                        <AddIcon />
                        등록
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {grpTreeList &&
                    (grpTreeList || []).map((row: IfTbGrpTree) => (
                      <TableRow key={`${row?.parent_id}.${row?.child_id}`}>
                        <TableCell>
                          {row?.parent_id}&nbsp;({getGrpName(row?.parent_id || '')})
                        </TableCell>
                        <TableCell>
                          {row?.child_id}&nbsp;({getGrpName(row?.child_id || '')})
                        </TableCell>
                        <TableCell align='center'>{row.grp_depth}</TableCell>
                        <TableCell align='right'>
                          <Button
                            onClick={() => handleEdit(row)}
                            color='primary'
                            variant='outlined'
                          >
                            수정
                          </Button>
                          &nbsp;
                          <Button
                            onClick={() => handleDelete(row)}
                            color='error'
                            variant='outlined'
                          >
                            삭제
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </DialogContent>
        <DialogActions>
          {/* <Button onClick={onClose}>닫기</Button> */}
          <Button onClick={(e) => handleClickClose(e, CLOSE_REASON.BUTTON)}>닫기</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isEdit} onClose={() => setIsEdit(false)}>
        <DialogTitle>부서 트리 {mode}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>상위 부서</InputLabel>
              <Select
                label='상위 부서'
                sx={{ marginTop: '8px' }}
                value={sel?.parent_id || ''}
                onChange={(e) => setSel({ ...sel, parent_id: e.target.value })}
              >
                {grpList?.map((grp: any) => (
                  <MenuItem key={grp.grp_id} value={grp.grp_id}>
                    {grp.grp_id} ({grp.grp_nm})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>하위 부서</InputLabel>
              <Select
                label='하위 부서'
                sx={{ marginTop: '8px' }}
                value={sel?.child_id || ''}
                onChange={(e) => setSel({ ...sel, child_id: e.target.value })}
              >
                {grpList?.map((grp: any) => (
                  <MenuItem key={grp.grp_id} value={grp.grp_id}>
                    {grp.grp_id} ({grp.grp_nm})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label='Depth'
              type='number'
              sx={{ minWidth: '240px' }}
              slotProps={{ htmlInput: { min: 0, max: 10 } }}
              value={sel?.grp_depth || 0}
              onChange={(e) => setSel({ ...sel, grp_depth: parseInt(e.target.value) })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEdit(false)}>취소</Button>
          <Button onClick={handleSave} variant='contained' color='primary'>
            저장
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
