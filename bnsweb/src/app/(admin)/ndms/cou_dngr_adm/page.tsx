'use client';

import Loading from '@/app/(admin)/comp/utils/Loading';
import { useLoginRole } from '@/app/(admin)/leftmenu/useLoginInfo';
import { FormCouDngrAdm } from '@/app/(admin)/ndms/cou_dngr_adm/FormCouDngrAdm';
import { SettingBtn } from '@/app/(admin)/settings/alm/SettingBtn';
import { listStyles } from '@/app/(admin)/settings/comp/commStyles';
import { SettingTitle } from '@/app/(admin)/settings/comp/SettingTitle';
import { IfTcmCouDngrAdm, TcmCouDngrAdm } from '@/models/ndms/tcm_cou_dngr_adm';
import { exportToXlsObjs } from '@/utils/xls-utils';
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

type Props = {};

const CouDngrAdmIndex = (_props: Props) => {
  const { data: list } = useSWR<IfTcmCouDngrAdm[]>(['/api/cou_dngr_adm/list']);
  const [sel, setSel] = useState(new TcmCouDngrAdm());
  const { hasAuth } = useLoginRole();

  const handleClickRow = (row: IfTcmCouDngrAdm) => {
    setSel({ ...row });
  };

  const handleExportExcel = () => {
    if (!list) return;
    exportToXlsObjs(
      ['admcode', 'chpsnnm', 'charge_dept', 'cttpc', 'rm', 'use_yn', 'rgsde', 'updde'],
      list,
      'cou_dngr_adm'
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
                  센싱정보 관리 기관정보
                </Typography>
                <Typography variant='body2' color='text.secondary' sx={listStyles.titleText}>
                  NDMS 센싱정보 관리 기관정보 목록입니다.
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
                        '관리기관코드',
                        '담당자명',
                        '담당부서',
                        '연락처',
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
                        key={row.admcode}
                        sx={listStyles.tableRow}
                        onClick={() => handleClickRow(row)}
                        className={clsx({ sel: row.admcode === sel?.admcode })}
                      >
                        <TableCell>{idx + 1}</TableCell>
                        {[
                          row.admcode,
                          row.chpsnnm,
                          row.charge_dept,
                          row.cttpc,
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
          <FormCouDngrAdm sel={sel} setSel={setSel} />
        </Box>
      </Box>
    </Box>
  );
};

export default CouDngrAdmIndex;
