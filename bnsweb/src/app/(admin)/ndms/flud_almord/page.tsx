'use client';

import Loading from '@/app/(admin)/comp/utils/Loading';
import { SettingTitle } from '@/app/(admin)/settings/comp/SettingTitle';
import { getTcmFludAlmordKey, IfTcmFludAlmord, TcmFludAlmord } from '@/models/ndms/tcm_flud_almord';
import TuneIcon from '@mui/icons-material/Tune';
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
import { FormFludAlmord } from '@/app/(admin)/ndms/flud_almord/FormFludAlmord';
import { listStyles } from '@/app/(admin)/settings/comp/commStyles';
import { SettingBtn } from '@/app/(admin)/settings/alm/SettingBtn';
import { exportToXlsObjs } from '@/utils/xls-utils';
import { useLoginRole } from '@/app/(admin)/leftmenu/useLoginInfo';
import { ProtectedComponent } from '@/abilities/abilities';

type Props = {};

const CouDngrAlmordIndex = (_props: Props) => {
  const { data: list } = useSWR<IfTcmFludAlmord[]>(['/api/flud_almord/list']);
  const [sel, setSel] = useState(new TcmFludAlmord());
  const { hasAuth } = useLoginRole();

  const handleClickRow = (row: IfTcmFludAlmord) => {
    setSel({ ...row });
  };

  const handleExportExcel = () => {
    if (!list) return;
    exportToXlsObjs(
      ['flcode', 'cd_dist_intrcp', 'sttusde', 'intrcp_sttus', 'rm', 'admcode', 'rgsde', 'updde'],
      list,
      'flud_almord'
    );
  };

  return (
    <Box sx={listStyles.rootBox}>
      <Box sx={listStyles.contentBox}>
        <Box sx={listStyles.listBox}>
          <Card sx={listStyles.card}>
            <SettingTitle>
              <Box sx={listStyles.titleBox}>
                <SvgIcon fontSize='large'>
                  <TuneIcon />
                </SvgIcon>
              </Box>
              <Box>
                <Typography variant='h5' fontWeight={700} color='text.primary'>
                  침수경보발령정보
                </Typography>
                <Typography variant='body2' color='text.secondary' sx={listStyles.titleText}>
                  NDMS 침수경보발령정보 목록입니다.
                </Typography>
              </Box>
              <Box flexGrow={1} />
              {hasAuth('Admin') && (
                <SettingBtn
                  btnType='xls'
                  onClick={handleExportExcel}
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
                <Table sx={{ minWidth: 900 }} stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>No</TableCell>
                      {[
                        '침수지점코드',
                        '차량제어기순번',
                        '상태변경일시',
                        '차단장비상태',
                        '비고',
                        '관리기관코드',
                        '등록일시',
                        '수정일시',
                      ].map((ele, id) => (
                        <TableCell key={id}>{ele}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(list || []).map((row, idx) => (
                      <TableRow
                        key={getTcmFludAlmordKey(row)}
                        sx={listStyles.tableRow}
                        onClick={() => handleClickRow(row)}
                        className={clsx({
                          sel: getTcmFludAlmordKey(row) === getTcmFludAlmordKey(sel),
                        })}
                      >
                        <TableCell>{idx + 1}</TableCell>
                        {[
                          row.flcode,
                          row.cd_dist_intrcp,
                          row.sttusde,
                          row.intrcp_sttus,
                          row.rm,
                          row.admcode,
                          row.rgsde,
                          row.updde,
                        ].map((ele, idx) => (
                          <TableCell key={idx}>{ele}</TableCell>
                        ))}
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
          <FormFludAlmord sel={sel} setSel={setSel} />
        </Box>
      </Box>
    </Box>
  );
};

export default CouDngrAlmordIndex;
