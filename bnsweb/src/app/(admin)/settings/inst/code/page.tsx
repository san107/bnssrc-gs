'use client';

import Loading from '@/app/(admin)/comp/utils/Loading';
import { FormCode } from '@/app/(admin)/settings/inst/code/FormCode';
import { SettingTitle } from '@/app/(admin)/settings/comp/SettingTitle';
import { IfTbCd, TbCd } from '@/models/comm/tb_cd';
import CodeIcon from '@mui/icons-material/Code';
import { Box, Card, SvgIcon, Typography } from '@mui/material';
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
import { listStyles } from '@/app/(admin)/settings/comp/commStyles';
import { SettingBtn } from '@/app/(admin)/settings/alm/SettingBtn';
import { useLoginRole } from '@/app/(admin)/leftmenu/useLoginInfo';
import { exportToXlsObjs } from '@/utils/xls-utils';

type Props = {};

const CodeIndex = (_props: Props) => {
  const { data: list } = useSWR<IfTbCd[]>(['/api/cd/list']);
  const [sel, setSel] = useState(new TbCd());

  const handleClickRow = (row: IfTbCd) => {
    setSel({ ...row });
  };

  const handleClickXlsDown = async () => {
    if (list === undefined) return;
    exportToXlsObjs(['cd', 'cd_grp', 'cd_id', 'cd_nm', 'cd_seq'], list, 'code');
  };

  const { hasAuth } = useLoginRole();
  return (
    <Box sx={listStyles.rootBox}>
      <Box sx={listStyles.contentBox}>
        <Box sx={listStyles.listBox}>
          <Card sx={listStyles.card}>
            <SettingTitle>
              <Box sx={listStyles.titleBox}>
                <SvgIcon fontSize='large'>
                  <CodeIcon />
                </SvgIcon>
              </Box>
              <Box>
                <Typography variant='h5' fontWeight={700} color='text.primary'>
                  코드 목록
                </Typography>
                <Typography variant='body2' color='text.secondary' sx={listStyles.titleText}>
                  등록된 코드 정보를 보여줍니다.
                </Typography>
              </Box>
              <Box flexGrow={1} />
              {hasAuth('Admin') && (
                <SettingBtn
                  btnType='xls'
                  onClick={handleClickXlsDown}
                  sx={listStyles.exelDownButton}
                >
                  다운로드
                </SettingBtn>
              )}
            </SettingTitle>

            {list ? (
              <TableContainer
                component={Paper}
                sx={listStyles.tableContainer}
                className='scroll-table'
              >
                <Table sx={{ minWidth: 650 }} stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>No</TableCell>
                      <TableCell>코드그룹</TableCell>
                      <TableCell>코드</TableCell>
                      <TableCell>코드ID</TableCell>
                      <TableCell>코드명</TableCell>
                      <TableCell>순서</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(list || []).map((row, idx) => (
                      <TableRow
                        key={row.cd}
                        sx={listStyles.tableRow}
                        onClick={() => handleClickRow(row)}
                        className={clsx({
                          sel: row.cd === sel.cd,
                        })}
                      >
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>{row.cd_grp}</TableCell>
                        <TableCell>{row.cd}</TableCell>
                        <TableCell>{row.cd_id}</TableCell>
                        <TableCell>{row.cd_nm}</TableCell>
                        <TableCell>{row.cd_seq}</TableCell>
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
          <FormCode sel={sel} setSel={setSel} />
        </Box>
      </Box>
    </Box>
  );
};

export default CodeIndex;
