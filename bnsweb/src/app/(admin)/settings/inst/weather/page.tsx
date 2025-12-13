'use client';

import Loading from '@/app/(admin)/comp/utils/Loading';
import { SettingTitle } from '@/app/(admin)/settings/comp/SettingTitle';
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
import useSWR from 'swr';
import { listStyles } from '@/app/(admin)/settings/comp/commStyles';
import { FormWeather } from '@/app/(admin)/settings/inst/weather/FormWeather';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import { IfTbWeather, TbWeather } from '@/models/tb_weather';
import { SettingBtn } from '@/app/(admin)/settings/alm/SettingBtn';
import { exportToXlsObjs } from '@/utils/xls-utils';
import { useLoginRole } from '@/app/(admin)/leftmenu/useLoginInfo';
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

type Props = {};

const WeatherIndex = (_props: Props) => {
  const { data: list, mutate } = useSWR<IfTbWeather[]>(['/api/weather/list']);
  const [sel, setSel] = useState(new TbWeather());
  const [localList, setLocalList] = useState<{ id: number; row: IfTbWeather }[]>([]);

  useEffect(() => {
    setLocalList((list || []).map((row) => ({ id: row.wt_seq!, row })));
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
            '/api/weather/update_disp_seqs',
            arr.map((ele, idx) => ({
              wt_seq: ele.row.wt_seq,
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
  }

  function handleDragCancel() {
    //setActiveItem(null);
  }

  const handleClickRow = (row: IfTbWeather) => {
    setSel({ ...row });
  };

  const handleExportExcel = () => {
    if (!list) return;
    exportToXlsObjs(['wt_seq', 'wt_rgn_nm', 'wt_lat', 'wt_lng'], list, 'weather');
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
                  <WbSunnyIcon />
                </SvgIcon>
              </Box>
              <Box>
                <Typography variant='h5' fontWeight={700} color='text.primary'>
                  날씨 지역 목록
                </Typography>
                <Typography variant='body2' color='text.secondary' sx={listStyles.titleText}>
                  등록된 날씨지역 정보를 보여줍니다.
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
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onDragCancel={handleDragCancel}
                >
                  <Table sx={{ minWidth: 650 }} stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>No</TableCell>
                        <TableCell>지역명</TableCell>
                        <TableCell>위도</TableCell>
                        <TableCell>경도</TableCell>
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
                            key={row.row.wt_seq}
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
          <FormWeather sel={sel} setSel={setSel} />
        </Box>
      </Box>
    </Box>
  );
};

const SortableRow = ({ no, row, sel, handleClickRow, ...props }) => {
  const sortable = useSortable({ id: row.wt_seq });
  const { attributes, listeners, setNodeRef, transition, transform } = sortable;
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TableRow
      key={row.wt_seq}
      ref={setNodeRef}
      style={style}
      {...props}
      {...attributes}
      {...listeners}
      sx={listStyles.tableRow}
      onClick={() => handleClickRow(row)}
      className={clsx({
        sel: row.wt_seq === sel?.wt_seq,
      })}
    >
      <TableCell>{no}</TableCell>
      <TableCell>{row.wt_rgn_nm}</TableCell>
      <TableCell>{row.wt_lat}</TableCell>
      <TableCell>{row.wt_lng}</TableCell>
    </TableRow>
  );
};

export default WeatherIndex;
