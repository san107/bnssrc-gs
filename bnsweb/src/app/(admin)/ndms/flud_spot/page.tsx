'use client';

import Loading from '@/app/(admin)/comp/utils/Loading';
import { SettingTitle } from '@/app/(admin)/settings/comp/SettingTitle';
import { IfTcmFludSpot, TcmFludSpot } from '@/models/ndms/tcm_flud_spot';
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
import { FormFludSpot } from '@/app/(admin)/ndms/flud_spot/FormFludSpot';
import { listStyles } from '@/app/(admin)/settings/comp/commStyles';
import { SettingBtn } from '@/app/(admin)/settings/alm/SettingBtn';
import { exportToXlsObjs } from '@/utils/xls-utils';
import { useLoginRole } from '@/app/(admin)/leftmenu/useLoginInfo';
import { ProtectedComponent } from '@/abilities/abilities';

type Props = {};

const FludSpotIndex = (_props: Props) => {
  const { data: spots } = useSWR<IfTcmFludSpot[]>(['/api/flud_spot/list']);
  const [sel, setSel] = useState(new TcmFludSpot());
  const { hasAuth } = useLoginRole();

  const handleClickRow = (row: IfTcmFludSpot) => {
    setSel({ ...row });
  };

  const handleExportExcel = () => {
    if (!spots) return;
    exportToXlsObjs(
      [
        'flcode',
        'flname',
        'fladdr',
        'bdong_cd',
        'lat',
        'lon',
        'advsry_wal',
        'alarm_wal',
        'flud_wal',
        'rm',
        'admcode',
        'use_yn',
        'rgsde',
        'updde',
      ],
      spots,
      'flud_spot'
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
                  침수지점정보
                </Typography>
                <Typography variant='body2' color='text.secondary' sx={listStyles.titleText}>
                  NDMS 침수지점정보 목록입니다.
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

            {spots ? (
              <TableContainer
                component={Paper}
                sx={listStyles.tableContainer}
                className='scroll-table'
              >
                <Table sx={{ minWidth: 1300 }} stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>No</TableCell>
                      {[
                        '침수지점코드',
                        '침수지점명',
                        '상세주소',
                        '법정동코드',
                        '위도',
                        '경도',
                        '주의수위',
                        '경보수위',
                        '침수수위',
                        '비고',
                        '관리기관코드',
                        '사용여부',
                        '등록일시',
                        '수정일시',
                      ].map((ele, id) => (
                        <TableCell key={id}>{ele}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(spots || []).map((row, idx) => (
                      <TableRow
                        key={row.flcode}
                        sx={listStyles.tableRow}
                        onClick={() => handleClickRow(row)}
                        className={clsx({ sel: row.flcode === sel?.flcode })}
                      >
                        <TableCell>{idx + 1}</TableCell>
                        {[
                          row.flcode,
                          row.flname,
                          row.fladdr,
                          row.bdong_cd,
                          row.lat,
                          row.lon,
                          row.advsry_wal,
                          row.alarm_wal,
                          row.flud_wal,
                          row.rm,
                          row.admcode,
                          row.use_yn,
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
          <FormFludSpot sel={sel} setSel={setSel} />
        </Box>
      </Box>
    </Box>
  );
};

export default FludSpotIndex;
