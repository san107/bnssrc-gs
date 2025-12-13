'use client';

import Loading from '@/app/(admin)/comp/utils/Loading';
import { MappingGateInfo } from '@/app/(admin)/ndms/mapping/MappingGateInfo';
import { SettingTitle } from '@/app/(admin)/settings/comp/SettingTitle';
import { IfTcmFludSpot, TcmFludSpot } from '@/models/ndms/tcm_flud_spot';
import TuneIcon from '@mui/icons-material/Tune';
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
import { CmmnCb } from '@/app/(admin)/comp/input/CmmnCb';
import { SettingBtn } from '@/app/(admin)/settings/alm/SettingBtn';
import { MappingWaterInfo } from '@/app/(admin)/ndms/mapping/MappingWaterInfo';
import { listStyles } from '@/app/(admin)/settings/comp/commStyles';
import { MappingEbrdInfo } from '@/app/(admin)/ndms/mapping/MappingEbrdInfo';

type Props = {};

const MappingIndex = (_props: Props) => {
  const { data: spots } = useSWR<IfTcmFludSpot[]>(['/api/flud_spot/list']);
  const [sel, setSel] = useState(new TcmFludSpot());

  const handleClickRow = (row: IfTcmFludSpot) => {
    setSel({ ...row });
  };

  const [mapType, setMapType] = useState('gate');

  const handleClickSync = () => {
    console.log('sync');
  };

  return (
    <Box sx={listStyles.rootBox}>
      {spots ? (
        <Box sx={listStyles.contentBox}>
          <Box sx={listStyles.listBoxWH}>
            <Card sx={listStyles.card}>
              <SettingTitle>
                <Box sx={listStyles.titleBox}>
                  <TuneIcon fontSize='large' />
                </Box>
                <Box>
                  <Typography variant='h5' fontWeight={700} color='text.primary'>
                    침수지점정보
                  </Typography>
                  <Typography variant='body2' color='text.secondary' sx={listStyles.titleText}>
                    설치된 침수지점의 정보를 보여줍니다.
                  </Typography>
                </Box>
                <Box flexGrow={1} />
                {false && mapType === 'water' && sel?.flcode && (
                  <SettingBtn onClick={handleClickSync} sx={{ minWidth: 100 }} btnType='sync'>
                    동기화
                  </SettingBtn>
                )}
                &nbsp;
                <CmmnCb
                  list={[
                    { val: 'gate', disp: '차량제어기' },
                    { val: 'water', disp: '수위측정소' },
                    { val: 'ebrd', disp: '전광판' },
                  ]}
                  val={mapType}
                  setVal={setMapType}
                />
              </SettingTitle>

              <TableContainer
                component={Paper}
                sx={listStyles.tableContainer}
                className='scroll-table'
              >
                <Table sx={{ minWidth: 500 }} stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>No</TableCell>
                      <TableCell>침수지점코드</TableCell>
                      <TableCell>침수지점명</TableCell>
                      <TableCell>사용여부</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(spots || []).map((row, idx) => (
                      <TableRow
                        key={row.flcode}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        onClick={() => handleClickRow(row)}
                        className={clsx({ sel: row.flcode === sel?.flcode })}
                      >
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>{row.flcode}</TableCell>
                        <TableCell>{row.flname}</TableCell>
                        <TableCell>{row.use_yn}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Box>
          <Box sx={listStyles.formBoxWH}>
            {mapType === 'gate' && <MappingGateInfo spot={sel} setSpot={setSel} />}
            {mapType === 'water' && <MappingWaterInfo spot={sel} setSpot={setSel} />}
            {mapType === 'ebrd' && <MappingEbrdInfo spot={sel} setSpot={setSel} />}
          </Box>
        </Box>
      ) : (
        <Card sx={{ padding: 2, height: '100%', width: '100%', display: 'flex' }}>
          <Loading />
        </Card>
      )}
    </Box>
  );
};

export default MappingIndex;
