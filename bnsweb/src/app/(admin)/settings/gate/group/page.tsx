'use client';

import { useConfirm } from '@/app/(admin)/comp/popup/DlgConfirm';
import Loading from '@/app/(admin)/comp/utils/Loading';
import { SettingBtn } from '@/app/(admin)/settings/alm/SettingBtn';
import { listStyles } from '@/app/(admin)/settings/comp/commStyles';
import { SettingTitle } from '@/app/(admin)/settings/comp/SettingTitle';
import { StyledCardActions } from '@/app/(admin)/settings/comp/StyledForm';
import { useDlgGroup } from '@/app/(admin)/settings/gate/group/DlgGroup';
import { GroupListMngr } from '@/app/(admin)/settings/gate/group/GroupListMngr';
import { IfTbGroup, TbGroup } from '@/models/tb_group';
import * as grputils from '@/utils/grp-utils';
import FolderSpecialIcon from '@mui/icons-material/FolderSpecial';
import { Box, Card, SvgIcon, Typography } from '@mui/material';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import axios from 'axios';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import useSWR, { useSWRConfig } from 'swr';

type Props = {};

const GroupIndex = (_props: Props) => {
  const { data: list } = useSWR<IfTbGroup[]>(['/api/group/list']);
  const { mutate } = useSWRConfig();

  const [sel, setSel] = useState(new TbGroup());

  const handleClickRow = (row: IfTbGroup) => {
    //
    setSel({ ...row });
  };

  useEffect(() => {
    list?.map((item) => {
      grputils.cntGroupEl(item?.grp_seq || 0).then((res) => {
        // console.log('res', res);
        const cntDiv = document.getElementById(`cnt-el-${item?.grp_seq}`);
        if (cntDiv) cntDiv.innerHTML = res || '0';
      });
    });
  }, [list, sel]);

  const handleEdit = () => {
    console.log('handleEdit', sel);
    dlgGroup.current
      ?.show(sel?.grp_seq)
      .then((res) => {
        console.log('res', res);
      })
      .catch((e) => {
        if (e?.cmd === 'close') return;
        console.error('E', e);
      });
  };

  const handleAdd = () => {
    dlgGroup.current
      ?.show(undefined)
      .then((res) => {
        console.log('res', res);
      })
      .catch((e) => {
        if (e?.cmd === 'close') return;
        console.error('E', e);
      });
  };

  const handleReset = () => {
    setSel(new TbGroup());
  };

  const confirm = useConfirm();
  const handleDelete = () => {
    confirm('확인', ['삭제하시겠습니까'])
      ?.then(() => {
        // console.log('삭제 확인. ');
        axios
          .post('/api/group/delete', sel)
          .then((res) => {
            console.log('res', res.data);
            toast.success('삭제 하였습니다');
            setSel(new TbGroup());
            mutate(() => true);
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

  const [dlgGroup, DlgGroup] = useDlgGroup();

  return (
    <Box sx={{ padding: 2, flexGrow: 1, height: '1px' }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2,
          height: '100%',
        }}
      >
        <Box
          sx={{
            flex: { xs: 'none' },
            height: { xs: 'auto', md: '100%' },
            width: { xs: '100%', md: '400px' },
          }}
        >
          <Card
            sx={{
              padding: 2,
              height: { xs: 'auto', md: '100%' },
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <SettingTitle>
              <Box sx={listStyles.titleBox}>
                <SvgIcon fontSize='large'>
                  <FolderSpecialIcon />
                </SvgIcon>
              </Box>
              <Box>
                <Typography variant='h5' fontWeight={700} color='text.primary'>
                  차단장비그룹 목록
                </Typography>
                <Typography variant='body2' color='text.secondary' sx={listStyles.titleText}>
                  등록된 차단장비그룹의 정보를 보여줍니다.
                </Typography>
              </Box>
            </SettingTitle>
            {list ? (
              <TableContainer
                component={Paper}
                sx={listStyles.tableContainer}
                className='scroll-table'
              >
                <Table sx={{ width: '100%' }} stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>그룹명</TableCell>
                      <TableCell align='center'>타입</TableCell>
                      <TableCell align='center'>등록갯수</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {list?.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} sx={{ textAlign: 'center' }}>
                          등록된 그룹이 없습니다.
                        </TableCell>
                      </TableRow>
                    )}
                    {(list || []).map((row) => (
                      <TableRow
                        key={row.grp_seq}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        onClick={() => handleClickRow(row)}
                        className={clsx({ sel: row.grp_seq === sel?.grp_seq })}
                      >
                        <TableCell>{row.grp_nm}</TableCell>
                        <TableCell align='center'>{grputils.getGrpType(row.grp_type)}</TableCell>
                        <TableCell align='center'>
                          <div id={`cnt-el-${row.grp_seq}`}></div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ margin: 'auto' }}>
                <Loading />
              </Box>
            )}
            <StyledCardActions>
              <SettingBtn btnType='add' onClick={handleAdd}>
                등록
              </SettingBtn>
              <SettingBtn btnType='edit' onClick={handleEdit} disabled={!sel?.grp_seq}>
                수정
              </SettingBtn>
              <SettingBtn btnType='reset' onClick={handleReset}>
                초기화
              </SettingBtn>
              <SettingBtn btnType='delete' onClick={handleDelete} disabled={!sel?.grp_seq}>
                삭제
              </SettingBtn>
            </StyledCardActions>
          </Card>
        </Box>
        {/* <Box
          sx={{
            width: { xs: '100%', md: '400px' },
            height: { xs: 'auto', md: '100%' },
          }}
        >
          <GroupForm sel={sel} setSel={setSel} />
        </Box> */}
        <Box
          sx={{
            flex: { xs: 'none', md: 2 },
            height: { xs: 'auto', md: '100%' },
          }}
        >
          <GroupListMngr sel={sel} setSel={setSel} />
        </Box>
      </Box>
      <DlgGroup />
    </Box>
  );
};

export default GroupIndex;
