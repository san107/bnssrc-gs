'use client';

import Loading from '@/app/(admin)/comp/utils/Loading';
import { SettingTitle } from '@/app/(admin)/settings/comp/SettingTitle';
import {
  getTcmCouDngrAlmordKey,
  IfTcmCouDngrAlmord,
  TcmCouDngrAlmord,
} from '@/models/ndms/tcm_cou_dngr_almord';
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
import { FormCouDngrAlmord } from '@/app/(admin)/ndms/cou_dngr_almord/FormCouDngrAlmord';
import { listStyles } from '@/app/(admin)/settings/comp/commStyles';
import { SettingBtn } from '@/app/(admin)/settings/alm/SettingBtn';
import { exportToXlsObjs } from '@/utils/xls-utils';
import { useLoginRole } from '@/app/(admin)/leftmenu/useLoginInfo';
import { ProtectedComponent } from '@/abilities/abilities';

const CouDngrAlmordIndex = () => {
  const { data: list } = useSWR<IfTcmCouDngrAlmord[]>(['/api/cou_dngr_almord/list']);
  const [sel, setSel] = useState(new TcmCouDngrAlmord());
  const { hasAuth } = useLoginRole();

  const handleClickRow = (row: IfTcmCouDngrAlmord) => {
    setSel({ ...row });
  };

  const handleExportExcel = () => {
    if (!list) return;
    exportToXlsObjs(
      [
        'dscode',
        'cd_dist_obsv',
        'almcode',
        'almde',
        'almgb',
        'almnote',
        'admcode',
        'rgsde',
        'updde',
      ],
      list,
      'cou_dngr_almord'
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
                  위험경보 발령정보
                </Typography>
                <Typography variant='body2' color='text.secondary' sx={listStyles.titleText}>
                  NDMS 위험경보 발령정보 목록입니다.
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
                <Table sx={{ minWidth: 1000 }} stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>No</TableCell>
                      {[
                        '시설물코드',
                        '계측기순번',
                        '경보코드',
                        '경보발령일시',
                        '발령구분',
                        '경보발령내용',
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
                        key={getTcmCouDngrAlmordKey(row)}
                        sx={listStyles.tableRow}
                        onClick={() => handleClickRow(row)}
                        className={clsx({
                          sel: getTcmCouDngrAlmordKey(row) === getTcmCouDngrAlmordKey(sel),
                        })}
                      >
                        <TableCell>{idx + 1}</TableCell>
                        {[
                          row.dscode,
                          row.cd_dist_obsv,
                          row.almcode,
                          row.almde,
                          row.almgb,
                          row.almnote,
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
          <FormCouDngrAlmord sel={sel} setSel={setSel} />
        </Box>
      </Box>
    </Box>
  );
};

export default CouDngrAlmordIndex;
