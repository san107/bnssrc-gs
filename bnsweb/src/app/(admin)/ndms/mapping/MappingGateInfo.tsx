'use client';

import { SettingTitle } from '@/app/(admin)/settings/comp/SettingTitle';
import { listStyles } from '@/app/(admin)/settings/comp/commStyles';
import { StyledCardActions } from '@/app/(admin)/settings/comp/StyledForm';
import {
  getTcmFludCarIntrcpKey,
  IfTcmFludCarIntrcp,
  TcmFludCarIntrcp,
} from '@/models/ndms/tcm_flud_car_intrcp';
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
import { getTbNdmsMapGateKey, IfTbNdmsMapGate } from '@/models/ndms/tb_ndms_map_gate';
import { GateLabel } from '@/app/(admin)/comp/input/GateLabel';
import { useDlgGate } from '@/app/(admin)/comp/popup/DlgGate';
import axios from 'axios';
import { toast } from 'sonner';
import { handleDialogRejection } from '@/utils/dialog-utils';

type Props = {
  spot: IfTcmFludSpot;
  setSpot: (v: IfTcmFludSpot) => void;
};

export const MappingGateInfo = ({ spot }: Props) => {
  const { data: ndmsGates } = useSWR<IfTcmFludCarIntrcp[]>(
    spot?.flcode && ['/api/flud_car_intrcp/list', { flcode: spot?.flcode }]
  );

  const { data: orgMappings, mutate } = useSWR<IfTbNdmsMapGate[]>(
    spot?.flcode && ['/api/ndms_map_gate/list', { flcode: spot?.flcode }]
  );

  const [mapping, setMapping] = useState(new Map<string, IfTbNdmsMapGate>());
  const [sel, setSel] = useState(new TcmFludCarIntrcp());

  useEffect(() => {
    const key = getTbNdmsMapGateKey;
    setMapping(
      (orgMappings || []).reduce((acc, ele) => {
        acc.set(key(ele), ele);
        return acc;
      }, new Map<string, IfTbNdmsMapGate>())
    );
  }, [orgMappings]);

  const handleClickRow = (row: IfTcmFludCarIntrcp) => {
    setSel({ ...row });
  };

  useEffect(() => {
    setSel(new TcmFludCarIntrcp());
  }, [spot?.flcode]);

  const handleSave = () => {
    axios
      .post('/api/ndms_map_gate/saves', {
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
    setSel(new TcmFludCarIntrcp());
    const key = getTbNdmsMapGateKey;
    setMapping(
      (orgMappings || []).reduce((acc, ele) => {
        acc.set(key(ele), ele);
        return acc;
      }, new Map<string, IfTbNdmsMapGate>())
    );
  };

  const key = getTbNdmsMapGateKey;
  const [dlgGate, DlgGate] = useDlgGate();

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
            차량 제어기
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={listStyles.titleText}>
            {/* 침수지점별 차단장비 연결 정보를 관리합니다. */}
            침수지점별 차량제어기와 차단장비를 연결합니다.
          </Typography>
        </Box>
      </SettingTitle>

      {ndmsGates ? (
        <TableContainer component={Paper} sx={listStyles.tableContainer} className='scroll-table'>
          <Table sx={{ minWidth: 500 }} stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>No</TableCell>
                {['침수지점코드', '차량제어기순번', '차량제어기명칭', '사용여부'].map((ele, id) => (
                  <TableCell key={id}>{ele}</TableCell>
                ))}
                <TableCell align='right'>차단장비 연결</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(ndmsGates || []).map((row, idx) => (
                <TableRow
                  key={getTcmFludCarIntrcpKey(row)}
                  sx={listStyles.tableRowNoPadding}
                  onClick={() => handleClickRow(row)}
                  className={clsx({
                    sel: getTcmFludCarIntrcpKey(row) === getTcmFludCarIntrcpKey(sel),
                  })}
                >
                  <TableCell>{idx + 1}</TableCell>
                  {[row.flcode, row.cd_dist_intrcp, row.nm_dist_intrcp, row.use_yn].map(
                    (ele, idx) => (
                      <TableCell key={idx}>{ele}</TableCell>
                    )
                  )}
                  <TableCell align='right'>
                    <GateLabel gateSeq={mapping.get(key(row))?.gate_seq} label='' />
                    {mapping.get(key(row))?.gate_seq && (
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
                        dlgGate.current
                          ?.show()
                          .then(({ gateSeq }) => {
                            mapping.set(key(row), {
                              flcode: row.flcode,
                              cd_dist_intrcp: row.cd_dist_intrcp,
                              gate_seq: gateSeq,
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
          startIcon={<SearchIcon />}
          sx={listStyles.commButton}
        >
          저장
        </Button>
        <Button
          color='secondary'
          onClick={handleReset}
          startIcon={<DeleteIcon />}
          sx={listStyles.commButton}
        >
          초기화
        </Button>
      </StyledCardActions>
      <DlgGate />
    </Card>
  );
};
