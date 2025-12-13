'use client';

import Loading from '@/app/(admin)/comp/utils/Loading';
import { FormCamera } from '@/app/(admin)/settings/camera/FormCamera';
import { SettingTitle } from '@/app/(admin)/settings/comp/SettingTitle';
import { IfTbCamera, TbCamera } from '@/models/tb_camera';
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
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { GiCctvCamera } from 'react-icons/gi';
import { useCameraList } from '@/hooks/useDevList';
import { CdIdLabel } from '@/app/(admin)/comp/input/CdIdLabel';
import { useLoginRole } from '@/app/(admin)/leftmenu/useLoginInfo';
import { SettingBtn } from '@/app/(admin)/settings/alm/SettingBtn';
import { exportToXlsObjs, getCodeMap, getCodeName } from '@/utils/xls-utils';
import axios from 'axios';
import { GrpLabel } from '@/app/(admin)/comp/input/GrpLabel';
import { listStyles } from '@/app/(admin)/settings/comp/commStyles';

type Props = {};

const CameraIndex = (_props: Props) => {
  const { data: list, mutate } = useCameraList();
  const [sel, setSel] = useState(new TbCamera());

  const handleClickRow = (row: IfTbCamera) => {
    setSel({ ...row });
  };

  const [localList, setLocalList] = useState<{ id: number; row: IfTbCamera }[]>([]);
  useEffect(() => {
    setLocalList((list || []).map((row) => ({ id: row.cam_seq!, row })));
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
            '/api/camera/update_disp_seqs',
            arr.map((ele, idx) => ({
              cam_seq: ele.row.cam_seq,
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
    const objs = list.map((ele) => {
      const obj = { ...ele };
      obj['cam_type_nm'] = getCodeName(cds, 'CT', ele.cam_type);
      obj['cam_stat_nm'] = getCodeName(cds, 'CS', ele.cam_stat);
      return obj;
    });
    exportToXlsObjs(
      [
        'cam_seq',
        'disp_seq',
        'cam_lat',
        'cam_lng',
        'cam_nm',
        'cam_type',
        'cam_type_nm',
        'cam_ip',
        'cam_port',
        'cam_user_id',
        'cam_pass',
        'cam_path_s',
        'cam_path_l',
        'cam_stat',
        'cam_stat_nm',
        'cam_stat_dt',
      ],
      objs.sort((a, b) => a.cam_seq! - b.cam_seq!),
      'camera'
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
                  <GiCctvCamera fontSize={'0.7em'} />
                </SvgIcon>
              </Box>
              <Box>
                <Typography variant='h5' fontWeight={700} color='text.primary'>
                  카메라 목록
                </Typography>
                <Typography variant='body2' color='text.secondary' sx={listStyles.titleText}>
                  설치된 카메라의 정보를 보여줍니다.
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
                        <TableCell align='right'>IP/PORT</TableCell>
                        <TableCell align='right'>저해상도</TableCell>
                        <TableCell align='right'>고해상도</TableCell>
                        <TableCell align='right'>상태</TableCell>
                        <TableCell align='right'>타입</TableCell>
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
                            key={row.row.cam_seq}
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
          <FormCamera sel={sel} setSel={setSel} />
        </Box>
      </Box>
    </Box>
  );
};

const SortableRow = ({ no, row, sel, handleClickRow, ...props }) => {
  const sortable = useSortable({ id: row.cam_seq });
  const { attributes, listeners, setNodeRef, transition, transform } = sortable;
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TableRow
      key={row.cam_seq}
      ref={setNodeRef}
      style={style}
      {...props}
      {...attributes}
      {...listeners}
      sx={listStyles.tableRow}
      onClick={() => handleClickRow(row)}
      className={clsx({ sel: row.cam_seq === sel?.cam_seq })}
    >
      <TableCell>{no || row.cam_seq}</TableCell>
      <TableCell>{row.cam_nm}</TableCell>
      <TableCell align='right'>
        {row.cam_ip}:{row.cam_port}
      </TableCell>
      <TableCell align='right'>{row.cam_path_s}</TableCell>
      <TableCell align='right'>{row.cam_path_l}</TableCell>
      <TableCell align='right'>
        <CdIdLabel grp='CS' id={row.cam_stat} isStat />
      </TableCell>
      <TableCell align='right'>
        <CdIdLabel grp='CT' id={row.cam_type} />
      </TableCell>
      <TableCell align='right'>{row.cam_lat}</TableCell>
      <TableCell align='right'>{row.cam_lng}</TableCell>
      <TableCell align='right'>
        <GrpLabel grpId={row.grp_id} />
      </TableCell>
    </TableRow>
  );
};

export default CameraIndex;
