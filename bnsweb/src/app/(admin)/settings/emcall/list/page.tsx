'use client';

import { CameraLabel } from '@/app/(admin)/comp/input/CameraLabel';
import { CdIdLabel } from '@/app/(admin)/comp/input/CdIdLabel';
import { GrpLabel } from '@/app/(admin)/comp/input/GrpLabel';
import { useAdminSensors } from '@/app/(admin)/comp/table/useAdminSensors';
import Loading from '@/app/(admin)/comp/utils/Loading';
import { useLoginRole } from '@/app/(admin)/leftmenu/useLoginInfo';
import { SettingBtn } from '@/app/(admin)/settings/alm/SettingBtn';
import { listStyles } from '@/app/(admin)/settings/comp/commStyles';
import { SettingTitle } from '@/app/(admin)/settings/comp/SettingTitle';
import { FormEmcall } from '@/app/(admin)/settings/emcall/list/FormEmcall';
import { useEmcallList } from '@/hooks/useDevList';
import { IfTbEmcall, TbEmcall } from '@/models/emcall/tb_emcall';
import { exportToXlsObjs } from '@/utils/xls-utils';
import { closestCenter, DndContext } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Box, Card, Paper, SvgIcon, TableContainer, Typography } from '@mui/material';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import axios from 'axios';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { PiBellRinging } from 'react-icons/pi';

type Props = {};

const EmcallPage = (_props: Props) => {
  const { data: list, mutate } = useEmcallList();

  const [sel, setSel] = useState(new TbEmcall());
  const [localList, setLocalList] = useState<{ id: number; row: IfTbEmcall }[]>([]);

  useEffect(() => {
    setLocalList((list || []).map((row) => ({ id: row.emcall_seq!, row })));
  }, [list]);

  const sensors = useAdminSensors();

  function handleDragStart() {
    //setActiveItem(event.active);
  }
  function handleDragEnd(event) {
    const { active, over } = event;

    if (active.id !== over.id) {
      setLocalList((items) => {
        const oldIndex = items.findIndex((ele) => ele.id === active.id);
        const newIndex = items.findIndex((ele) => ele.id === over.id);
        const arr = arrayMove(items, oldIndex, newIndex);

        axios
          .post(
            '/api/emcall/update_disp_seqs',
            arr.map((ele, idx) => ({
              emcall_seq: ele.row.emcall_seq,
              disp_seq: idx + 1,
            }))
          )
          .then(() => {
            console.log('save ok ');
            mutate();
          });
        return arr;
      });
    }
    //setActiveItem(null);
  }

  function handleDragCancel() {
    //setActiveItem(null);
  }

  function handleClickRow(row: IfTbEmcall) {
    setSel(row);
  }

  const handleClickXlsDown = async () => {
    if (list === undefined) return;
    const objs = list.map((ele) => {
      const obj = { ...ele };
      return obj;
    });
    exportToXlsObjs(
      [
        'emcall_seq',
        'disp_seq',
        'emcall_lat',
        'emcall_lng',
        'emcall_nm',
        'emcall_grp_seq',
        'comm_stat',
        'grp_id',
      ],
      objs.sort((a, b) => a.emcall_seq! - b.emcall_seq!),
      'emcall'
    );
  };

  const { hasAuth } = useLoginRole();
  return (
    <Box sx={listStyles.rootBox}>
      <Box sx={listStyles.contentBox}>
        <Box sx={listStyles.listBox}>
          <Card sx={listStyles.card}>
            <SettingTitle>
              <Box sx={listStyles.titleBox}>
                <SvgIcon fontSize='large'>
                  <PiBellRinging fontSize={'0.7em'} />
                </SvgIcon>
              </Box>
              <Box>
                <Typography variant='h5' fontWeight={700} color='text.primary'>
                  {/* 비상통화장치 목록 */}
                  비상벨 수신 목록
                </Typography>
                <Typography variant='body2' color='text.secondary' sx={listStyles.titleText}>
                  {/* 설치된 비상통화장치의 정보를 보여줍니다. */}
                  설치된 비상벨 수신 목록의 정보를 보여줍니다.
                </Typography>
              </Box>
              <Box flexGrow={1} />
              {hasAuth('Admin') && (
                <SettingBtn
                  btnType='xls'
                  onClick={handleClickXlsDown}
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
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onDragCancel={handleDragCancel}
                >
                  <Table sx={{ minWidth: 800 }} stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>No</TableCell>
                        <TableCell>이름</TableCell>
                        <TableCell>ID(매칭코드)</TableCell>
                        <TableCell>카메라</TableCell>
                        <TableCell align='right'>상태</TableCell>
                        <TableCell align='right'>위도</TableCell>
                        <TableCell align='right'>경도</TableCell>
                        <TableCell align='right'>그룹</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <SortableContext
                        items={localList || []}
                        strategy={verticalListSortingStrategy}
                      >
                        {(localList || []).map((row, idx) => (
                          <SortableRow
                            no={idx + 1}
                            key={row.row.emcall_seq}
                            row={row.row}
                            sel={sel}
                            handleClickRow={handleClickRow}
                          />
                        ))}
                      </SortableContext>
                    </TableBody>
                  </Table>
                </DndContext>
              </TableContainer>
            ) : (
              <Box sx={{ margin: 'auto' }}>
                <Loading />
              </Box>
            )}
          </Card>
        </Box>
        <Box sx={listStyles.formBox}>
          <FormEmcall sel={sel} setSel={setSel} />
        </Box>
      </Box>
    </Box>
  );
};

const SortableRow = ({
  no,
  row,
  sel,
  handleClickRow,
  ...props
}: {
  no: number;
  row: IfTbEmcall;
  sel: IfTbEmcall;
  handleClickRow: (row: IfTbEmcall) => void;
}) => {
  const sortable = useSortable({ id: row.emcall_seq! });
  const { attributes, listeners, setNodeRef, transition, transform } = sortable;
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TableRow
      key={row.emcall_seq}
      ref={setNodeRef}
      style={style}
      {...props}
      {...attributes}
      {...listeners}
      sx={listStyles.tableRow}
      onClick={() => handleClickRow(row)}
      className={clsx({ sel: row.emcall_seq === sel?.emcall_seq })}
    >
      <TableCell>{no || row.emcall_seq}</TableCell>
      <TableCell>{row.emcall_nm}</TableCell>
      <TableCell>{row.emcall_id}</TableCell>
      <TableCell>
        <CameraLabel camSeq={row.cam_seq} style={false} />
      </TableCell>
      <TableCell align='right'>
        <CdIdLabel grp='CS' id={row.comm_stat} isStat />
      </TableCell>
      <TableCell align='right'>{row.emcall_lat}</TableCell>
      <TableCell align='right'>{row.emcall_lng}</TableCell>
      <TableCell align='right'>
        <GrpLabel grpId={row.grp_id} />
      </TableCell>
    </TableRow>
  );
};

export default EmcallPage;
