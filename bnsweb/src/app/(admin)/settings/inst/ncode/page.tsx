'use client';

import Loading from '@/app/(admin)/comp/utils/Loading';
import { useLoginRole } from '@/app/(admin)/leftmenu/useLoginInfo';
import { SettingBtn } from '@/app/(admin)/settings/alm/SettingBtn';
import { listStyles } from '@/app/(admin)/settings/comp/commStyles';
import { SettingTitle } from '@/app/(admin)/settings/comp/SettingTitle';
import { FormNCode } from '@/app/(admin)/settings/inst/ncode/FormNCode';
import { IfTbNCd, ncd_key, TbNCd } from '@/models/comm/tb_ncd';
import { exportToXlsObjs } from '@/utils/xls-utils';
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

type Props = {};

const CodeIndex = (_props: Props) => {
  const { data: list } = useSWR<IfTbNCd[]>(['/api/ncd/list']);
  const [sel, setSel] = useState(new TbNCd());

  const handleClickRow = (row: IfTbNCd) => {
    setSel({ ...row });
  };

  const handleClickXlsDown = async () => {
    if (list === undefined) return;
    exportToXlsObjs(['ncd_grp', 'ncd', 'ncd_id', 'ncd_nm', 'ncd_seq'], list, 'ncode');
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
                  N코드 목록
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
                      <TableCell>코드명</TableCell>
                      <TableCell>순서</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(list || []).map((row, idx) => (
                      <TableRow
                        key={ncd_key(row)}
                        sx={listStyles.tableRow}
                        onClick={() => handleClickRow(row)}
                        className={clsx({
                          sel: ncd_key(row) === ncd_key(sel),
                        })}
                      >
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>{row.ncd_grp}</TableCell>
                        <TableCell>{row.ncd_id}</TableCell>
                        <TableCell>{row.ncd_nm}</TableCell>
                        <TableCell>{row.ncd_seq}</TableCell>
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
          <FormNCode sel={sel} setSel={setSel} />
        </Box>
      </Box>
    </Box>
  );
};

export default CodeIndex;
