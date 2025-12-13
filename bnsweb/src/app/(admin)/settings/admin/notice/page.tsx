'use client';

import Loading from '@/app/(admin)/comp/utils/Loading';
import { SettingTitle } from '@/app/(admin)/settings/comp/SettingTitle';
import { listStyles } from '@/app/(admin)/settings/comp/commStyles';
import { Box, Card, SvgIcon, Typography } from '@mui/material';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import clsx from 'clsx';
import { useState, useEffect } from 'react';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { SettingBtn } from '@/app/(admin)/settings/alm/SettingBtn';
import { useLoginRole } from '@/app/(admin)/leftmenu/useLoginInfo';
import { exportToXlsObjs } from '@/utils/xls-utils';
import { IfTbBoard, TbBoard } from '@/models/tb_board';
import {
  closestCenter,
  DndContext,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import axios from 'axios';
import useSWR from 'swr';
import { FormNotice } from '@/app/(admin)/settings/admin/notice/FormNotice';

const NoticePage = () => {
  const [sel, setSel] = useState<IfTbBoard>(new TbBoard());
  const [localList, setLocalList] = useState<{ id: number; row: IfTbBoard }[]>([]);
  const { data: list, mutate } = useSWR<IfTbBoard[]>(['/api/board/list', { bd_type: 'NOTICE' }]);

  useEffect(() => {
    if (list) {
      setLocalList(list.map((row) => ({ id: row.bd_seq || 0, row })));
    }
  }, [list]);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 6,
      },
    })
  );

  function handleDragStart() {}
  function handleDragCancel() {}

  function handleDragEnd(event) {
    const { active, over } = event;

    if (active.id !== over.id) {
      setLocalList((items) => {
        const oldIndex = items.findIndex((ele) => ele.id === active.id);
        const newIndex = items.findIndex((ele) => ele.id === over.id);
        const arr = arrayMove(items, oldIndex, newIndex);

        // Update the display sequence in the backend
        axios
          .post(
            '/api/board/update_disp_seqs',
            arr.map((ele, idx) => ({
              bd_seq: ele.row.bd_seq,
              disp_seq: idx + 1,
            }))
          )
          .then(() => {
            console.log('save ok');
            mutate();
            // Refresh the list if needed
          });
        return arr;
      });
    }
  }

  const handleClickRow = (row: IfTbBoard) => {
    setSel({ ...row });

    console.log('row ', row);
  };

  const handleClickXlsDown = async () => {
    if (!list || list.length === 0) return;
    exportToXlsObjs(
      [
        'bd_seq',
        'disp_seq',
        'bd_type',
        'bd_title',
        'bd_contents',
        'bd_create_dt',
        'bd_update_dt',
        'bd_views',
        'user_id',
      ],
      list.sort((a, b) => (a.bd_seq || 0) - (b.bd_seq || 0)),
      'notice'
    );
  };

  const { hasAuth } = useLoginRole();

  return (
    <Box sx={listStyles.rootBox}>
      <Box sx={listStyles.contentBox}>
        <Box sx={listStyles.listBoxWH}>
          <Card sx={listStyles.card}>
            <SettingTitle>
              <Box sx={listStyles.titleBox}>
                <SvgIcon fontSize='large'>
                  <AssignmentIcon />
                </SvgIcon>
              </Box>
              <Box>
                <Typography variant='h5' fontWeight={700} color='text.primary'>
                  공지사항 목록
                </Typography>
                <Typography variant='body2' color='text.secondary' sx={listStyles.titleText}>
                  등록된 공지사항의 목록을 보여줍니다.
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
                  <Table sx={{ minWidth: 700 }} stickyHeader>
                    <colgroup>
                      <col width='10%' />
                      <col width='50%' />
                      <col width='10%' />
                      <col width='15%' />
                      <col width='15%' />
                    </colgroup>
                    <TableHead>
                      <TableRow>
                        <TableCell>No</TableCell>
                        <TableCell>제목</TableCell>
                        <TableCell align='right'>작성자</TableCell>
                        <TableCell align='right'>작성일</TableCell>
                        <TableCell align='right'>수정일</TableCell>
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
                            key={row.row.bd_seq}
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
        <Box sx={listStyles.formBoxWH}>
          <FormNotice sel={sel} setSel={setSel} />
        </Box>
      </Box>
    </Box>
  );
};

const SortableRow = ({ no, row, sel, handleClickRow, ...props }) => {
  const sortable = useSortable({ id: row.bd_seq });
  const { attributes, listeners, setNodeRef, transition, transform } = sortable;
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const formatDate = (dateStr: any) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0];
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      {...props}
      {...attributes}
      {...listeners}
      sx={listStyles.tableRow}
      onClick={() => handleClickRow(row)}
      className={clsx({ sel: row.bd_seq === sel?.bd_seq })}
    >
      <TableCell>{no}</TableCell>
      <TableCell
        sx={{
          maxWidth: '300px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {row.bd_title}
      </TableCell>
      <TableCell align='right'>{row.user_id}</TableCell>
      <TableCell align='right'>{formatDate(row.bd_create_dt)}</TableCell>
      <TableCell align='right'>{formatDate(row.bd_update_dt)}</TableCell>
    </TableRow>
  );
};

export default NoticePage;
