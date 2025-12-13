'use client';

import { CdIdLabel } from '@/app/(admin)/comp/input/CdIdLabel';
import { GrpLabel } from '@/app/(admin)/comp/input/GrpLabel';
import Loading from '@/app/(admin)/comp/utils/Loading';
import { useLoginRole } from '@/app/(admin)/leftmenu/useLoginInfo';
import { SettingBtn } from '@/app/(admin)/settings/alm/SettingBtn';
import { listStyles } from '@/app/(admin)/settings/comp/commStyles';
import { SettingTitle } from '@/app/(admin)/settings/comp/SettingTitle';
import { FormEbrd } from '@/app/(admin)/settings/ebrd/regist/FormEbrd';
import { useEbrdList } from '@/hooks/useDevList';
import { IfTbEbrd, TbEbrd } from '@/models/ebrd/tb_ebrd';
import { exportToXlsObjs } from '@/utils/xls-utils';
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
import DisplaySettingsIcon from '@mui/icons-material/DisplaySettings';
import { Box, Card, SvgIcon, Typography } from '@mui/material';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import axios from 'axios';
import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';

type Props = {};

const EbrdPage = (_props: Props) => {
  const { data: list, mutate } = useEbrdList();
  const [sel, setSel] = useState(new TbEbrd());
  const [changed, setChanged] = useState(false);
  const changedSkip = useRef(false);

  useEffect(() => {
    if (changedSkip.current) {
      changedSkip.current = false;
      return;
    }
    setChanged(true);
  }, [sel]);

  const handleClickRow = (row: IfTbEbrd) => {
    changedSkip.current = true;
    setSel({ ...row });
    setChanged(false);
  };

  //const router = useRouter();

  const handleDoubleClickRow = (row: IfTbEbrd) => {
    ///setSel({ ...row });
    console.log('double click', row);
    // router.push(`/settings/ebrd/detail?ebrd_seq=${row.ebrd_seq}`);
  };

  const [localList, setLocalList] = useState<{ id: number; row: IfTbEbrd }[]>([]);
  useEffect(() => {
    const llist = (list || []).map((row) => ({ id: row.ebrd_seq!, row }));
    setLocalList(llist);
    if (sel?.ebrd_seq) {
      const row = llist.find((ele) => ele.row.ebrd_seq === sel.ebrd_seq)?.row;
      if (row) {
        changedSkip.current = true;
        setSel(row);
        setChanged(false);
      } else {
        setSel(new TbEbrd());
      }
    }
    // eslint-disable-next-line
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
            '/api/ebrd/update_disp_seqs',
            arr.map((ele, idx) => ({
              ebrd_seq: ele.row.ebrd_seq,
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

  const handleClickXlsDown = async () => {
    if (list === undefined) return;
    const objs = list.map((ele) => {
      const obj = { ...ele };
      return obj;
    });
    exportToXlsObjs(
      [
        'ebrd_seq',
        'disp_seq',
        'ebrd_lat',
        'ebrd_lng',
        'ebrd_nm',
        'ebrd_ip',
        'ebrd_port',
        'ebrd_stat',
        'grp_id',
      ],
      objs.sort((a, b) => a.ebrd_seq! - b.ebrd_seq!),
      'ebrd'
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
                  <DisplaySettingsIcon />
                </SvgIcon>
              </Box>
              <Box>
                <Typography variant='h5' fontWeight={700} color='text.primary'>
                  전광판 목록
                </Typography>
                <Typography variant='body2' color='text.secondary' sx={listStyles.titleText}>
                  설치된 전광판의 정보를 보여줍니다.
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
                  <Table sx={{ minWidth: 1000 }} stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>No</TableCell>
                        <TableCell>이름</TableCell>
                        <TableCell>ID</TableCell>
                        <TableCell align='right'>IP/PORT</TableCell>
                        <TableCell align='right'>위도</TableCell>
                        <TableCell align='right'>경도</TableCell>
                        <TableCell align='right'>상태</TableCell>
                        <TableCell align='right'>전송여부</TableCell>
                        <TableCell align='right'>긴급</TableCell>
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
                            key={row.row.ebrd_seq}
                            row={row.row}
                            sel={sel}
                            handleClickRow={handleClickRow}
                            handleDoubleClickRow={handleDoubleClickRow}
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
          <FormEbrd sel={sel} setSel={setSel} changed={changed} />
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
  handleDoubleClickRow,
  ...props
}: {
  no: number;
  row: IfTbEbrd;
  sel: IfTbEbrd;
  handleClickRow: (row: IfTbEbrd) => void;
  handleDoubleClickRow: (row: IfTbEbrd) => void;
}) => {
  const sortable = useSortable({ id: row.ebrd_seq! });
  const { attributes, listeners, setNodeRef, transition, transform } = sortable;
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TableRow
      key={row.ebrd_seq}
      ref={setNodeRef}
      style={style}
      {...props}
      {...attributes}
      {...listeners}
      sx={listStyles.tableRow}
      onClick={() => handleClickRow(row)}
      onDoubleClick={() => handleDoubleClickRow(row)}
      className={clsx({ sel: row.ebrd_seq === sel?.ebrd_seq })}
    >
      <TableCell>{no || row.ebrd_seq}</TableCell>
      <TableCell>
        {row.ebrd_nm} ({row.ebrd_seq})
      </TableCell>
      <TableCell>{row.ebrd_id}</TableCell>
      <TableCell align='right'>
        {row.ebrd_ip}:{row.ebrd_port}
      </TableCell>
      <TableCell align='right'>{row.ebrd_lat}</TableCell>
      <TableCell align='right'>{row.ebrd_lng}</TableCell>
      <TableCell align='right'>
        <CdIdLabel grp='CS' id={row.comm_stat} isStat />
      </TableCell>
      <TableCell align='right' sx={{ color: row.send_yn === 'Y' ? 'green' : 'red' }}>
        {row.send_yn === 'Y' ? '전송' : '미전송'}
      </TableCell>
      <TableCell align='right' sx={{ color: row.ebrd_event === 'EMER_START' ? 'red' : 'green' }}>
        {row.ebrd_event === 'EMER_START' ? '긴급' : ''}
      </TableCell>
      <TableCell align='right'>
        <GrpLabel grpId={row.grp_id} />
      </TableCell>
    </TableRow>
  );
};

export default EbrdPage;
