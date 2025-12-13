'use client';

import { CameraLabel } from '@/app/(admin)/comp/input/CameraLabel';
import { CdIdLabel } from '@/app/(admin)/comp/input/CdIdLabel';
import { GrpLabel } from '@/app/(admin)/comp/input/GrpLabel';
import { WaterGrpIdLabel } from '@/app/(admin)/comp/input/WaterGrpIdLabel';
import Loading from '@/app/(admin)/comp/utils/Loading';
import { useLoginRole } from '@/app/(admin)/leftmenu/useLoginInfo';
import { SettingBtn } from '@/app/(admin)/settings/alm/SettingBtn';
import { listStyles } from '@/app/(admin)/settings/comp/commStyles';
import { SettingTitle } from '@/app/(admin)/settings/comp/SettingTitle';
import { FormWater } from '@/app/(admin)/settings/water/FormWater';
import { LevelSlider } from '@/app/icons/LevelSlider';
import { useWaterList } from '@/hooks/useDevList';
import { IfTbWater, TbWater } from '@/models/water/tb_water';
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

type Props = {};

const WaterIndex = (_props: Props) => {
  const { data: list, mutate } = useWaterList();
  const [sel, setSel] = useState(new TbWater());

  const handleClickRow = (row: IfTbWater) => {
    setSel({ ...row });
  };

  const [localList, setLocalList] = useState<{ id: number; row: IfTbWater }[]>([]);
  useEffect(() => {
    setLocalList((list || []).map((row) => ({ id: row.water_seq!, row })));
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

  function handleDragEnd(event) {
    const { active, over } = event;

    if (active.id !== over.id) {
      setLocalList((items) => {
        const oldIndex = items.findIndex((ele) => ele.id === active.id);
        const newIndex = items.findIndex((ele) => ele.id === over.id);
        const arr = arrayMove(items, oldIndex, newIndex);

        axios
          .post(
            '/api/water/update_disp_seqs',
            arr.map((ele, idx) => ({
              water_seq: ele.row.water_seq,
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

  const handleClickXlsDown = async () => {
    if (list === undefined) return;
    const cds = await getCodeMap();
    const cameras = await getCameraMap();
    const objs = list.map((ele) => {
      const obj = { ...ele };
      obj['cam_nm'] = getCameraName(cameras, ele.cam_seq);
      obj['water_type_nm'] = getCodeName(cds, 'WT', ele.water_type);
      obj['water_stat_nm'] = getCodeName(cds, 'WS', ele.water_stat);
      obj['comm_stat_nm'] = getCodeName(cds, 'CS', ele.comm_stat);
      return obj;
    });
    exportToXlsObjs(
      [
        'water_seq',
        'disp_seq',
        'water_dev_id',
        'water_nm',
        'water_lat',
        'water_lng',
        'cam_seq',
        'cam_nm',
        'limit_attn',
        'limit_warn',
        'limit_alert',
        'limit_crit',
        'water_type',
        'water_type_nm',
        'water_dt',
        'water_level',
        'water_stat',
        'water_stat_nm',
        'comm_stat',
        'comm_stat_nm',
      ],
      objs.sort((a, b) => a.water_seq! - b.water_seq!),
      'water'
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
                  <LevelSlider fontSize={'0.7em'} />
                </SvgIcon>
              </Box>
              <Box>
                <Typography variant='h5' fontWeight={700} color='text.primary'>
                  수위계 목록
                </Typography>
                <Typography variant='body2' color='text.secondary' sx={listStyles.titleText}>
                  설치된 수위계의 정보를 보여줍니다.
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
                  onDragEnd={handleDragEnd}
                >
                  <Table sx={{ minWidth: 1200 }} stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>No</TableCell>
                        <TableCell>이름</TableCell>
                        <TableCell align='right'>수위계 ID</TableCell>
                        <TableCell align='right'>수위계 타입</TableCell>
                        <TableCell align='right'>동작모드</TableCell>
                        <TableCell align='right'>그룹ID</TableCell>
                        <TableCell align='right'>카메라</TableCell>
                        <TableCell align='right'>상태</TableCell>
                        <TableCell align='right'>통신</TableCell>
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
                            key={row.row.water_seq}
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
          <FormWater sel={sel} setSel={setSel} />
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
  row: IfTbWater;
  sel: IfTbWater;
  handleClickRow: (row: IfTbWater) => void;
}) => {
  const sortable = useSortable({ id: row.water_seq! });
  const { attributes, listeners, setNodeRef, transition, transform } = sortable;
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TableRow
      key={row.water_seq}
      ref={setNodeRef}
      style={style}
      {...props}
      {...attributes}
      {...listeners}
      sx={listStyles.tableRow}
      onClick={() => handleClickRow(row)}
      className={clsx({ sel: row.water_seq === sel?.water_seq })}
    >
      <TableCell>{no || row.water_seq}</TableCell>
      <TableCell>{row.water_nm}</TableCell>
      <TableCell align='right'>{row.water_dev_id}</TableCell>
      <TableCell align='right'>
        <CdIdLabel grp='WT' id={row.water_type} />
      </TableCell>
      <TableCell align='right'>
        <span className={clsx({ 'font-bold': row.water_mod === 'Grp' })}>
          <CdIdLabel grp='WMOD' id={row.water_mod} />
        </span>
      </TableCell>
      <TableCell align='right'>
        <WaterGrpIdLabel waterSeq={row.water_seq} />
      </TableCell>
      <TableCell align='right'>
        <CameraLabel camSeq={row.cam_seq} style={false} />
      </TableCell>
      <TableCell align='right'>
        <CdIdLabel grp='WS' id={row.water_stat} isStat />
      </TableCell>
      <TableCell align='right'>
        <CdIdLabel grp='CS' id={row.comm_stat} isStat />
      </TableCell>
      <TableCell align='right'>{row.water_lat}</TableCell>
      <TableCell align='right'>{row.water_lng}</TableCell>
      <TableCell align='right'>
        <GrpLabel grpId={row.grp_id} />
      </TableCell>
    </TableRow>
  );
};

export default WaterIndex;
