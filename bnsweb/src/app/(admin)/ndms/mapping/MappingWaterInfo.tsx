'use client';

import { SettingTitle } from '@/app/(admin)/settings/comp/SettingTitle';
import { IfTcmFludSpot } from '@/models/ndms/tcm_flud_spot';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import TuneIcon from '@mui/icons-material/Tune';
import {
  Box,
  Button,
  Card,
  IconButton,
  Paper,
  SvgIcon,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { getTcmFludWalKey, IfTcmFludWal, TcmFludWal } from '@/models/ndms/tcm_flud_wal';
import { getTbNdmsMapWaterKey, IfTbNdmsMapWater } from '@/models/ndms/tb_ndms_map_water';
import axios from 'axios';
import { toast } from 'sonner';
import { useDlgWater } from '@/app/(admin)/comp/popup/DlgWater';
import { WaterLabel } from '@/app/(admin)/comp/input/WaterLabel';
import { listStyles } from '@/app/(admin)/settings/comp/commStyles';
import { StyledCardActions } from '@/app/(admin)/settings/comp/StyledForm';
import SaveIcon from '@mui/icons-material/Save';
import RestoreIcon from '@mui/icons-material/Restore';
import { handleDialogRejection } from '@/utils/dialog-utils';

type Props = {
  spot: IfTcmFludSpot;
  setSpot: (v: IfTcmFludSpot) => void;
};

export const MappingWaterInfo = ({ spot }: Props) => {
  const { data: ndmsWaters } = useSWR<IfTcmFludWal[]>(
    spot?.flcode && ['/api/flud_wal/list', { flcode: spot?.flcode }]
  );
  const { data: orgMappings, mutate } = useSWR<IfTbNdmsMapWater[]>(
    spot?.flcode && ['/api/ndms_map_water/list', { flcode: spot?.flcode }]
  );

  const [mapping, setMapping] = useState(new Map<string, IfTbNdmsMapWater>());

  useEffect(() => {
    const key = getTbNdmsMapWaterKey;
    setMapping(
      (orgMappings || []).reduce((acc, ele) => {
        acc.set(key(ele), ele);
        return acc;
      }, new Map<string, IfTbNdmsMapWater>())
    );
  }, [orgMappings]);

  const [sel, setSel] = useState(new TcmFludWal());

  const handleClickRow = (row: IfTcmFludWal) => {
    setSel({ ...row });
  };

  useEffect(() => {
    setSel(new TcmFludWal());
  }, [spot?.flcode]);

  const handleSave = () => {
    console.log('save');
    axios
      .post('/api/ndms_map_water/saves', {
        flcode: spot.flcode,
        list: Array.from(mapping.values()),
      })
      .then(() => {
        mutate();
        toast.success('저장하였습니다');
      })
      .catch((e) => {
        console.error('E', e);
        toast.error('실패하였습니다.(error : ' + e?.message + ')');
      });
  };
  const handleReset = () => {
    setSel(new TcmFludWal());
    const key = getTbNdmsMapWaterKey;
    setMapping(
      (orgMappings || []).reduce((acc, ele) => {
        acc.set(key(ele), ele);
        return acc;
      }, new Map<string, IfTbNdmsMapWater>())
    );
  };

  const key = getTbNdmsMapWaterKey;

  const [dlgWater, DlgWater] = useDlgWater();

  return (
    <Card sx={listStyles.card}>
      <SettingTitle>
        <Box sx={listStyles.titleBox}>
          <SvgIcon fontSize='large'>
            <TuneIcon />
          </SvgIcon>
        </Box>
        <Box>
          <Typography variant='h5' fontWeight={700} color='text.primary'>
            수위 측정소
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={listStyles.titleText}>
            {/* 침수지점별 수위계 연결 정보를 관리합니다.  */}
            침수지점별 수위측정소와 수위계를 연결합니다.
          </Typography>
        </Box>
      </SettingTitle>

      {ndmsWaters ? (
        <TableContainer component={Paper} sx={listStyles.tableContainer} className='scroll-table'>
          <Table sx={{ minWidth: 500 }} stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>No</TableCell>
                {['침수지점코드', '수위측정소순번', '수위측정소명칭', '사용여부'].map((ele, id) => (
                  <TableCell key={id}>{ele}</TableCell>
                ))}
                <TableCell align='right'>수위계 연결</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(ndmsWaters || []).map((row, idx) => (
                <TableRow
                  key={getTcmFludWalKey(row)}
                  sx={listStyles.tableRowNoPadding}
                  onClick={() => handleClickRow(row)}
                  className={clsx({
                    sel: getTcmFludWalKey(row) === getTcmFludWalKey(sel),
                  })}
                >
                  <TableCell>{idx + 1}</TableCell>
                  {[row.flcode, row.cd_dist_wal, row.nm_dist_wal, row.use_yn].map((ele, idx) => (
                    <TableCell key={idx}>{ele}</TableCell>
                  ))}
                  <TableCell align='right'>
                    <WaterLabel waterSeq={mapping.get(key(row))?.water_seq} label='' />
                    {mapping.get(key(row))?.water_seq && (
                      <IconButton
                        size='small'
                        onClick={() => {
                          mapping.delete(key(row));
                          setMapping(new Map(mapping));
                        }}
                      >
                        <DeleteIcon fontSize='inherit' />
                      </IconButton>
                    )}
                    <IconButton
                      size='small'
                      onClick={() => {
                        dlgWater.current
                          ?.show()
                          .then(({ waterSeq }) => {
                            mapping.set(key(row), {
                              flcode: row.flcode,
                              cd_dist_wal: row.cd_dist_wal,
                              water_seq: waterSeq,
                            });
                            setMapping(new Map(mapping));
                          })
                          .catch((rejection) => {
                            handleDialogRejection(rejection);
                          });
                      }}
                    >
                      <SearchIcon fontSize='inherit' />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Box sx={{ margin: 'auto' }}>데이터가 없습니다.</Box>
      )}
      <StyledCardActions>
        <Button
          color='primary'
          onClick={handleSave}
          startIcon={<SaveIcon />}
          sx={listStyles.commButton}
        >
          저장
        </Button>
        <Button
          color='secondary'
          onClick={handleReset}
          startIcon={<RestoreIcon />}
          sx={listStyles.commButton}
        >
          초기화
        </Button>
      </StyledCardActions>
      <DlgWater />
    </Card>
  );
};
