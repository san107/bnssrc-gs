'use client';

import Loading from '@/app/(admin)/comp/utils/Loading';
import { SettingTitle } from '@/app/(admin)/settings/comp/SettingTitle';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import { Box, Card, Typography } from '@mui/material';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import clsx from 'clsx';
import { useState } from 'react';
import useSWR from 'swr';

/** @jsxImportSource @emotion/react */
import { FormUser } from '@/app/(admin)/settings/admin/login/FormUser';
import { IfTbLogin, TbLogin } from '@/models/tb_login';
import { css } from '@emotion/react';
import { CdIdLabel } from '@/app/(admin)/comp/input/CdIdLabel';
import { listStyles } from '@/app/(admin)/settings/comp/commStyles';
import { GrpLabel } from '@/app/(admin)/comp/input/GrpLabel';
import { useLoginInfo } from '@/app/(admin)/leftmenu/useLoginInfo';

type Props = {};

const LoginIndex = (_props: Props) => {
  const { data: list } = useSWR<IfTbLogin[]>(['/api/login/list']);

  const [sel, setSel] = useState(new TbLogin());
  const [edit, setEdit] = useState(false);

  const handleClickRow = (row: IfTbLogin) => {
    setSel({ ...row });
    setEdit(true);
  };
  const { login } = useLoginInfo();
  return (
    <Box sx={listStyles.rootBox}>
      <Box sx={listStyles.contentBox}>
        <Box sx={listStyles.listBox}>
          <Card sx={listStyles.card}>
            <SettingTitle>
              <Box sx={listStyles.titleBox}>
                <PeopleAltIcon sx={{ fontSize: 40 }} />
              </Box>
              <Box>
                <Typography variant='h5' fontWeight={700} color='text.primary'>
                  계정 목록
                </Typography>
                <Typography variant='body2' color='text.secondary' sx={listStyles.titleText}>
                  등록된 사용자 계정의 목록을 보여줍니다.
                </Typography>
              </Box>
            </SettingTitle>

            {list ? (
              <TableContainer
                component={Paper}
                sx={listStyles.tableContainer}
                css={css`
                  & .sel {
                    background-color: #eef;
                  }
                  & tr {
                    cursor: pointer;
                  }
                `}
                className='scroll-table'
              >
                <Table sx={{ minWidth: 600 }} stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>이름</TableCell>
                      <TableCell align='right'>이메일</TableCell>
                      <TableCell align='right'>권한</TableCell>
                      <TableCell align='right'>부서</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(list || [])
                      .filter((v) => {
                        if (login.user_role === 'Inst') return true;
                        if (v.user_role === 'Inst') return false; // 설치자 제외.
                        return true;
                      })
                      .map((row) => (
                        <TableRow
                          key={row.user_id}
                          sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                          onClick={() => handleClickRow(row)}
                          className={clsx({ sel: row.user_id === sel?.user_id })}
                        >
                          <TableCell>{row.user_id}</TableCell>
                          <TableCell>{row.user_name}</TableCell>
                          <TableCell align='right'>{row.user_email}</TableCell>
                          <TableCell align='right'>
                            <CdIdLabel grp='UR' id={row.user_role} />
                          </TableCell>
                          <TableCell align='right'>
                            <GrpLabel grpId={row.grp_id} />
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
          </Card>
        </Box>
        <Box sx={listStyles.formBox}>
          <FormUser sel={sel} setSel={setSel} edit={edit} setEdit={setEdit} list={list} />
        </Box>
      </Box>
    </Box>
  );
};

export default LoginIndex;
