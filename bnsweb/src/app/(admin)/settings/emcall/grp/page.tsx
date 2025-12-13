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
import { FormGrp } from '@/app/(admin)/settings/emcall/grp/FormGrp';
import { useEmcallGrpList } from '@/hooks/useDevList';
import { IfTbEmcallGrp, TbEmcallGrp } from '@/models/emcall/tb_emcall_grp';
import { exportToXlsObjs } from '@/utils/xls-utils';
import { closestCenter, DndContext } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { VolumeUpOutlined } from '@mui/icons-material';
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

type Props = {};

const Page = (_props: Props) => {
  const { data: list, mutate } = useEmcallGrpList();

  const [sel, setSel] = useState(new TbEmcallGrp());
  const [localList, setLocalList] = useState<{ id: number; row: IfTbEmcallGrp }[]>([]);

  useEffect(() => {
    setLocalList((list || []).map((row) => ({ id: row.emcall_grp_seq!, row })));
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
            '/api/emcall_grp/update_disp_seqs',
            arr.map((ele, idx) => ({
              emcall_grp_seq: ele.row.emcall_grp_seq,
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
        'emcall_grp_seq',
        'emcall_grp_nm',
        'emcall_grp_id',
        'emcall_grp_ip',
        'emcall_grp_port',
        'comm_stat',
        'grp_id',
      ],
      objs.sort((a, b) => a.emcall_grp_seq! - b.emcall_grp_seq!),
      'emcall'
    );
  };

  function handleClickRow(row: IfTbEmcallGrp) {
    setSel(row);
  }

  const { hasAuth } = useLoginRole();
  return (
    <Box sx={listStyles.rootBox}>
      <Box sx={listStyles.contentBox}>
        <Box sx={listStyles.listBox}>
          <Card sx={listStyles.card}>
            <SettingTitle>
              <Box sx={listStyles.titleBox}>
                <SvgIcon fontSize='large'>
                  <VolumeUpOutlined />
                </SvgIcon>
              </Box>
              <Box>
                <Typography variant='h5' fontWeight={700} color='text.primary'>
                  {/* 비상통화장치 송출그룹 목록 */}
                  스피커 송출그룹 목록
                </Typography>
                <Typography variant='body2' color='text.secondary' sx={listStyles.titleText}>
                  {/* 등록된 비상통화장치 송출그룹의 정보를 보여줍니다. */}
                  등록된 스피커 송출그룹의 정보를 보여줍니다.
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
                        <TableCell align='right'>IP/PORT</TableCell>
                        <TableCell align='right'>상태</TableCell>
                        <TableCell align='right'>카메라</TableCell>
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
                            key={row.row.emcall_grp_seq}
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
          <FormGrp sel={sel} setSel={setSel} />
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
  row: IfTbEmcallGrp;
  sel: IfTbEmcallGrp;
  handleClickRow: (row: IfTbEmcallGrp) => void;
}) => {
  const sortable = useSortable({ id: row.emcall_grp_seq! });
  const { attributes, listeners, setNodeRef, transition, transform } = sortable;
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TableRow
      key={row.emcall_grp_seq}
      ref={setNodeRef}
      style={style}
      {...props}
      {...attributes}
      {...listeners}
      sx={listStyles.tableRow}
      onClick={() => handleClickRow(row)}
      className={clsx({ sel: row.emcall_grp_seq === sel?.emcall_grp_seq })}
    >
      <TableCell>{no || row.emcall_grp_seq}</TableCell>
      <TableCell>{row.emcall_grp_nm}</TableCell>
      <TableCell>{row.emcall_grp_id}</TableCell>
      <TableCell align='right'>
        {row.emcall_grp_ip}:{row.emcall_grp_port}
      </TableCell>
      <TableCell align='right'>
        <CdIdLabel grp='CS' id={row.comm_stat} isStat />
      </TableCell>
      <TableCell align='right'>
        <CameraLabel camSeq={row.cam_seq} />
      </TableCell>
      <TableCell align='right'>{row.emcall_grp_lat}</TableCell>
      <TableCell align='right'>{row.emcall_grp_lng}</TableCell>
      <TableCell align='right'>
        <GrpLabel grpId={row.grp_id} />
      </TableCell>
    </TableRow>
  );
};

export default Page;
