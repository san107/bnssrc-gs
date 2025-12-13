'use client';

import Loading from '@/app/(admin)/comp/utils/Loading';
import { SettingTitle } from '@/app/(admin)/settings/comp/SettingTitle';
import {
  getTcmFludCarIntrcpKey,
  IfTcmFludCarIntrcp,
  TcmFludCarIntrcp,
} from '@/models/ndms/tcm_flud_car_intrcp';
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
import { FormFludCarIntrcp } from '@/app/(admin)/ndms/flud_car_intrcp/FormFludCarIntrcp';
import { listStyles } from '@/app/(admin)/settings/comp/commStyles';
import { SettingBtn } from '@/app/(admin)/settings/alm/SettingBtn';
import { exportToXlsObjs } from '@/utils/xls-utils';
import { useLoginRole } from '@/app/(admin)/leftmenu/useLoginInfo';
import { ProtectedComponent } from '@/abilities/abilities';

type Props = {};

const TcmFludCarIntrcpIndex = (_props: Props) => {
  const { data: list } = useSWR<IfTcmFludCarIntrcp[]>(['/api/flud_car_intrcp/list']);
  const [sel, setSel] = useState(new TcmFludCarIntrcp());
  const { hasAuth } = useLoginRole();

  const handleClickRow = (row: IfTcmFludCarIntrcp) => {
    setSel({ ...row });
  };

  const handleExportExcel = () => {
    if (!list) return;
    exportToXlsObjs(
      [
        'flcode',
        'cd_dist_intrcp',
        'nm_dist_intrcp',
        'gb_intrcp',
        'mod_intrcp',
        'comm_sttus',
        'intrcp_sttus',
        'lat',
        'lon',
        'rm',
        'use_yn',
        'rgsde',
        'updde',
      ],
      list,
      'flud_car_intrcp'
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
                  차량제어기정보
                </Typography>
                <Typography variant='body2' color='text.secondary' sx={listStyles.titleText}>
                  NDMS 차량제어기정보 목록입니다.
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
                <Table sx={{ minWidth: 1300 }} stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>No</TableCell>
                      {[
                        '침수지점코드',
                        '차량제어기순번',
                        '차량제어기명칭',
                        '진출입유형',
                        '차단모드',
                        '통신상태',
                        '차단장비상태',
                        '위도',
                        '경도',
                        '비고',
                        '사용여부',
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
                        key={getTcmFludCarIntrcpKey(row)}
                        sx={listStyles.tableRow}
                        onClick={() => handleClickRow(row)}
                        className={clsx({
                          sel: getTcmFludCarIntrcpKey(row) === getTcmFludCarIntrcpKey(sel),
                        })}
                      >
                        <TableCell>{idx + 1}</TableCell>
                        {[
                          row.flcode,
                          row.cd_dist_intrcp,
                          row.nm_dist_intrcp,
                          row.gb_intrcp,
                          row.mod_intrcp,
                          row.comm_sttus,
                          row.intrcp_sttus,
                          row.lat,
                          row.lon,
                          row.rm,
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
          <FormFludCarIntrcp sel={sel} setSel={setSel} />
        </Box>
      </Box>
    </Box>
  );
};

export default TcmFludCarIntrcpIndex;
