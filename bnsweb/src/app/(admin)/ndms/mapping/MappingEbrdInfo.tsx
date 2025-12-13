'use client';

import { EbrdLabel } from '@/app/(admin)/comp/input/EbrdLabel';
import { useDlgEbrd } from '@/app/(admin)/comp/popup/DlgEbrd';
import { listStyles } from '@/app/(admin)/settings/comp/commStyles';
import { SettingTitle } from '@/app/(admin)/settings/comp/SettingTitle';
import { StyledCardActions } from '@/app/(admin)/settings/comp/StyledForm';
import { getTbNdmsMapEbrdKey, IfTbNdmsMapEbrd } from '@/models/ndms/tb_ndms_map_ebrd';
import { getTcmFludBoardKey, IfTcmFludBoard, TcmFludBoard } from '@/models/ndms/tcm_flud_board';
import { IfTcmFludSpot } from '@/models/ndms/tcm_flud_spot';
import { handleDialogRejection } from '@/utils/dialog-utils';
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
import axios from 'axios';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import useSWR from 'swr';

type Props = {
  spot: IfTcmFludSpot;
  setSpot: (v: IfTcmFludSpot) => void;
};

export const MappingEbrdInfo = ({ spot }: Props) => {
  const { data: ndmsBoards } = useSWR<IfTcmFludBoard[]>(
    spot?.flcode && ['/api/flud_board/list', { flcode: spot?.flcode }]
  );

  const { data: orgMappings, mutate } = useSWR<IfTbNdmsMapEbrd[]>(
    spot?.flcode && ['/api/ndms_map_ebrd/list', { flcode: spot?.flcode }]
  );

  const [mapping, setMapping] = useState(new Map<string, IfTbNdmsMapEbrd>());
  const [sel, setSel] = useState(new TcmFludBoard());

  useEffect(() => {
    const key = getTbNdmsMapEbrdKey;
    setMapping(
      (orgMappings || []).reduce((acc, ele) => {
        acc.set(key(ele), ele);
        return acc;
      }, new Map<string, IfTbNdmsMapEbrd>())
    );
  }, [orgMappings]);

  const handleClickRow = (row: IfTcmFludBoard) => {
    setSel({ ...row });
  };

  useEffect(() => {
    setSel(new TcmFludBoard());
  }, [spot?.flcode]);

  const handleSave = () => {
    axios
      .post('/api/ndms_map_ebrd/saves', {
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
    setSel(new TcmFludBoard());
    const key = getTbNdmsMapEbrdKey;
    setMapping(
      (orgMappings || []).reduce((acc, ele) => {
        acc.set(key(ele), ele);
        return acc;
      }, new Map<string, IfTbNdmsMapEbrd>())
    );
  };

  const key = getTbNdmsMapEbrdKey;

  const [dlgEbrd, DlgEbrd] = useDlgEbrd();

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
            전광판
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={listStyles.titleText}>
            {/* 침수지점별 차단장비 연결 정보를 관리합니다. */}
            침수지점별 전광판을 연결합니다.
          </Typography>
        </Box>
      </SettingTitle>

      {ndmsBoards ? (
        <TableContainer component={Paper} sx={listStyles.tableContainer} className='scroll-table'>
          <Table sx={{ minWidth: 500 }} stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>No</TableCell>
                {['침수지점코드', '전광판순번', '전광판명칭', '사용여부'].map((ele, id) => (
                  <TableCell key={id}>{ele}</TableCell>
                ))}
                <TableCell align='right'>전광판 연결</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(ndmsBoards || []).map((row, idx) => (
                <TableRow
                  key={getTcmFludBoardKey(row)}
                  sx={listStyles.tableRowNoPadding}
                  onClick={() => handleClickRow(row)}
                  className={clsx({
                    sel: getTcmFludBoardKey(row) === getTcmFludBoardKey(sel),
                  })}
                >
                  <TableCell>{idx + 1}</TableCell>
                  {[row.flcode, row.cd_dist_board, row.nm_dist_board, row.use_yn].map(
                    (ele, idx) => (
                      <TableCell key={idx}>{ele}</TableCell>
                    )
                  )}
                  <TableCell align='right'>
                    <EbrdLabel ebrdSeq={mapping.get(key(row))?.ebrd_seq} label='' />
                    {mapping.get(key(row))?.ebrd_seq && (
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
                        dlgEbrd.current
                          ?.show()
                          .then(({ ebrdSeq }) => {
                            mapping.set(key(row), {
                              flcode: row.flcode,
                              cd_dist_board: row.cd_dist_board,
                              ebrd_seq: ebrdSeq,
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
      <DlgEbrd />
    </Card>
  );
};
