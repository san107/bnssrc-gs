'use client';

import { CameraLabel } from '@/app/(admin)/comp/input/CameraLabel';
import { CdIdLabel } from '@/app/(admin)/comp/input/CdIdLabel';
import Loading from '@/app/(admin)/comp/utils/Loading';
import { useLoginRole } from '@/app/(admin)/leftmenu/useLoginInfo';
import { SettingBtn } from '@/app/(admin)/settings/alm/SettingBtn';
import { SettingTitle } from '@/app/(admin)/settings/comp/SettingTitle';
import { FormGate } from '@/app/(admin)/settings/gate/list/FormGate';
import { BoomGate } from '@/app/icons/BoomGate';
import { IfTbGate, TbGate } from '@/models/gate/tb_gate';
import {
  exportToXlsObjs,
  getCameraMap,
  getCameraName,
  getCodeMap,
  getCodeName,
} from '@/utils/xls-utils';
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
import { useEffect, useState } from 'react';
import { useGateList } from '@/hooks/useDevList';
import { GrpLabel } from '@/app/(admin)/comp/input/GrpLabel';
import { listStyles } from '@/app/(admin)/settings/comp/commStyles';

type Props = {};

const GateIndex = (_props: Props) => {
  const { data: list, mutate } = useGateList();
  const [sel, setSel] = useState(new TbGate());

  const handleClickRow = (row: IfTbGate) => {
    setSel({ ...row });
  };

  const [localList, setLocalList] = useState<{ id: number; row: IfTbGate }[]>([]);
  useEffect(() => {
    setLocalList((list || []).map((row) => ({ id: row.gate_seq!, row })));
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
            '/api/gate/update_disp_seqs',
            arr.map((ele, idx) => ({
              gate_seq: ele.row.gate_seq,
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
    const cds = await getCodeMap();
    const cameras = await getCameraMap();
    const objs = list.map((ele) => {
      const obj = { ...ele };
      obj['gate_type_nm'] = getCodeName(cds, 'GT', ele.gate_type);
      obj['down_type_nm'] = getCodeName(cds, 'GDT', ele.down_type);
      obj['auto_down_cond_nm'] = getCodeName(cds, 'WS', ele.auto_down_cond as string);
      obj['gate_stat_nm'] = getCodeName(cds, 'GS', ele.gate_stat);
      obj['cmd_rslt_nm'] = getCodeName(cds, 'GR', ele.cmd_rslt);
      obj['cam_nm'] = getCameraName(cameras, ele.cam_seq);

      return obj;
    });
    exportToXlsObjs(
      [
        'gate_seq',
        'disp_seq',
        'gate_lat',
        'gate_lng',
        'gate_nm',
        'gate_ip',
        'gate_port',
        'gate_type',
        'gate_type_nm',
        'down_type',
        'down_type_nm',
        'auto_down_cond',
        'auto_down_cond_nm',
        'gate_no',
        'cam_seq',
        'cam_nm',
        'gate_stat',
        'gate_stat_nm',
        'cmd_rslt',
        'cmd_rslt_nm',
      ],
      objs.sort((a, b) => a.gate_seq! - b.gate_seq!),
      'gate'
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
                  <BoomGate fontSize={'0.7em'} />
                </SvgIcon>
              </Box>
              <Box>
                <Typography variant='h5' fontWeight={700} color='text.primary'>
                  차단장비 목록
                </Typography>
                <Typography variant='body2' color='text.secondary' sx={listStyles.titleText}>
                  설치된 차단장비의 정보를 보여줍니다.
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
                  <Table sx={{ minWidth: 1200 }} stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>No</TableCell>
                        <TableCell>이름</TableCell>
                        <TableCell align='right'>IP</TableCell>
                        <TableCell align='right'>Port</TableCell>
                        <TableCell align='right'>차단장비 타입</TableCell>
                        <TableCell align='right'>차단 방식</TableCell>
                        <TableCell align='right'>주 카메라</TableCell>
                        <TableCell align='right'>상태</TableCell>
                        <TableCell align='right'>결과</TableCell>
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
                            key={row.row.gate_seq}
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
          <FormGate sel={sel} setSel={setSel} />
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
  no;
  row: IfTbGate;
  sel;
  handleClickRow;
}) => {
  const sortable = useSortable({ id: row.gate_seq! });
  const { attributes, listeners, setNodeRef, transition, transform } = sortable;
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TableRow
      key={row.gate_seq}
      ref={setNodeRef}
      style={style}
      {...props}
      {...attributes}
      {...listeners}
      sx={listStyles.tableRow}
      onClick={() => handleClickRow(row)}
      className={clsx({ sel: row.gate_seq === sel?.gate_seq })}
    >
      <TableCell>{no || row.gate_seq}</TableCell>
      <TableCell>{row.gate_nm}</TableCell>
      <TableCell align='right'>{row.gate_ip}</TableCell>
      <TableCell align='right'>{row.gate_port}</TableCell>
      <TableCell align='right'>
        <CdIdLabel grp='GT' id={row.gate_type} />
      </TableCell>
      <TableCell align='right'>
        <CdIdLabel grp='GDT' id={row.down_type} />
      </TableCell>
      <TableCell align='right'>
        <CameraLabel camSeq={row.cam_seq} style={false} />
      </TableCell>
      <TableCell align='right'>
        <CdIdLabel grp='GS' id={row.gate_stat} isStat />
      </TableCell>
      <TableCell align='right'>
        <CdIdLabel grp='GR' id={row.cmd_rslt} isStat />
      </TableCell>
      <TableCell align='right'>{row.gate_lat}</TableCell>
      <TableCell align='right'>{row.gate_lng}</TableCell>
      <TableCell align='right'>
        <GrpLabel grpId={row.grp_id} />
      </TableCell>
    </TableRow>
  );
};

export default GateIndex;
