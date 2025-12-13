'use client';

import { ProtectedComponent } from '@/abilities/abilities';
import Loading from '@/app/(admin)/comp/utils/Loading';
import { useLoginRole } from '@/app/(admin)/leftmenu/useLoginInfo';
import { FormFludBoard } from '@/app/(admin)/ndms/flud_board/FormFludBoard';
import { SettingBtn } from '@/app/(admin)/settings/alm/SettingBtn';
import { listStyles } from '@/app/(admin)/settings/comp/commStyles';
import { SettingTitle } from '@/app/(admin)/settings/comp/SettingTitle';
import { getTcmFludBoardKey, IfTcmFludBoard, TcmFludBoard } from '@/models/ndms/tcm_flud_board';
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

const TcmFludBoardIndex = (_props: Props) => {
  const { data: list } = useSWR<IfTcmFludBoard[]>(['/api/flud_board/list']);
  const [sel, setSel] = useState(new TcmFludBoard());
  const { hasAuth } = useLoginRole();

  const handleClickRow = (row: IfTcmFludBoard) => {
    setSel({ ...row });
  };

  const handleExportExcel = () => {
    if (!list) return;
    exportToXlsObjs(
      [
        'flcode',
        'cd_dist_board',
        'nm_dist_board',
        'msg_board',
        'comm_sttus',
        'lat',
        'lon',
        'rm',
        'use_yn',
        'rgsde',
        'updde',
      ],
      list,
      'flud_board'
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
                  전광판 정보
                </Typography>
                <Typography variant='body2' color='text.secondary' sx={listStyles.titleText}>
                  NDMS 전광판 정보 목록입니다.
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
                        '전광판순번',
                        '전광판명칭',
                        '표출 메시지',
                        '통신 상태',
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
                        key={getTcmFludBoardKey(row)}
                        sx={listStyles.tableRow}
                        onClick={() => handleClickRow(row)}
                        className={clsx({
                          sel: getTcmFludBoardKey(row) === getTcmFludBoardKey(sel),
                        })}
                      >
                        <TableCell>{idx + 1}</TableCell>
                        {[
                          row.flcode,
                          row.cd_dist_board,
                          row.nm_dist_board,
                          row.msg_board,
                          row.comm_sttus,
                          row.lat,
                          row.lon,
                          row.rm,
                          row.use_yn,
                          row.rgsde,
                          row.updde,
                        ].map((ele, idx) => (
                          <TableCell
                            key={idx}
                            style={{ maxWidth: idx === 3 ? '250px' : undefined }}
                          >
                            {ele}
                          </TableCell>
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
          <FormFludBoard sel={sel} setSel={setSel} />
        </Box>
      </Box>
    </Box>
  );
};

export default TcmFludBoardIndex;
