import { useDrawerCameraStore } from '@/app/(admin)/comp/drawer/DrawerCamera';
import { CdIdLabel } from '@/app/(admin)/comp/input/CdIdLabel';
import * as maputils from '@/utils/map-utils';
import * as strutils from '@/utils/str-utils';
import * as grputils from '@/utils/grp-utils';
import { isCameraCmd, isCameraStat, useWsMsg } from '@/app/ws/useWsMsg';
import { useRefComponent } from '@/hooks/useRefComponent';
import { IfTbCamera } from '@/models/tb_camera';
import { mapStore } from '@/store/mapStore';
import { camerautils } from '@/utils/camera-utils';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import ListAltIcon from '@mui/icons-material/ListAlt';
import RoomIcon from '@mui/icons-material/Room';
import SearchIcon from '@mui/icons-material/Search';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import React, { useEffect, useState } from 'react';
// import useSWR from 'swr';
import { create } from 'zustand';
import { useCameraList } from '@/hooks/useDevList';
import { GrpLabel } from '@/app/(admin)/comp/input/GrpLabel';
import { CustomDrawer, DrawerHeader, CustomTable } from '@/app/(admin)/comp/drawer/StyledDrawer';
import FolderSharedIcon from '@mui/icons-material/FolderShared';
import ArrowCircleDownIcon from '@mui/icons-material/ArrowCircleDown';
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';

type Props = {
  open: () => void;
  close: () => void;
  isOpened: boolean;
};

export const DrawerCameraList = React.forwardRef<Props, unknown>((props, ref) => {
  const [open, setOpen] = useState<boolean>(false);
  const { map } = mapStore();
  const { ref: refDrawer } = useDrawerCameraStore();
  const [keyword, setKeyword] = useState<string>('');
  const [tmpKeyword, setTmpKeyword] = useState<string>('');
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  // const { data: list, mutate } = useSWR<IfTbCamera[]>(open && [`/api/camera/list`]);
  const { data: list, mutate } = useCameraList(open);

  useEffect(() => {}, []);

  const handleSearch = () => {
    // console.log(searchKeyword);
    setKeyword(tmpKeyword);
  };

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  // 상세보기
  const openCameraDrawer = (row: IfTbCamera) => {
    refDrawer?.current?.open(row);
  };

  // 맵으로 위치 이동
  const moveMapPosition = (row: IfTbCamera) => {
    // console.log('row', row);
    // 경도: longitude (127)
    // 위도: latitude (37)
    maputils.moveMap(map, [row.cam_lng, row.cam_lat]);
  };

  React.useImperativeHandle<Props, Props>(
    ref,
    (): Props => ({
      open: () => {
        handleDrawerOpen();
      },
      close: () => {
        handleDrawerClose();
      },
      isOpened: open,
    })
  );

  useWsMsg((msg) => {
    if (!open) return;
    if (isCameraStat(msg) || isCameraCmd(msg)) {
      mutate();
    }
  });

  const filteredList = (list || []).filter((ele) =>
    !!keyword ? ele.cam_nm?.includes(keyword) : true
  );

  const grouped = grputils.groupByDevice(filteredList, (row) => row.grp_id);

  const toggleGroup = (grpId: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [grpId]: !prev[grpId],
    }));
  };

  return (
    <Box sx={{ display: 'flex', overflow: 'hidden' }}>
      <CustomDrawer variant='persistent' anchor='right' open={open}>
        <DrawerHeader sx={{ display: 'flex', position: 'sticky', top: 0, zIndex: 100 }}>
          <ListAltIcon sx={{ color: '#ffffff' }} />
          <div style={{ marginRight: 'auto', paddingLeft: '10px' }}>
            <Typography variant='h5' sx={{ color: '#ffffff' }}>
              카메라 목록
            </Typography>
          </div>
          <div>
            <IconButton
              onClick={handleDrawerClose}
              sx={{
                color: '#ffffff',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  transform: 'scale(1.1)',
                  transition: 'all 0.2s ease',
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </div>
        </DrawerHeader>
        <Divider />
        <Box sx={{ display: 'flex', padding: 3 }}>
          <TextField
            label='검색어 입력'
            value={tmpKeyword}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position='start'>
                    <SearchIcon />
                  </InputAdornment>
                ),
              },
            }}
            variant='outlined'
            onChange={(e) => setTmpKeyword(e.target.value || '')}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
          />
          <Button variant='contained' size='small' onClick={handleSearch}>
            검색
          </Button>
        </Box>
        <Divider />

        <CustomTable>
          <thead>
            <tr>
              {[
                '상태',
                '이름',
                <RoomIcon key='roomicon' />,
                <KeyboardArrowRightIcon key='arrowrighticon' />,
              ].map((ele, idx) => (
                <th key={idx}>{ele}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(grouped).map(([grpId, cameras]) => (
              <React.Fragment key={grpId}>
                <tr>
                  <td
                    colSpan={4}
                    style={{
                      fontWeight: 'bold',
                      textAlign: 'left',
                      paddingLeft: '10px',
                      color: '#33489c',
                      cursor: 'pointer',
                    }}
                    onClick={() => toggleGroup(grpId)}
                  >
                    <FolderSharedIcon sx={{ marginRight: '10px' }} />
                    <GrpLabel grpId={grpId} />
                    {collapsedGroups[grpId] ? (
                      <ArrowCircleDownIcon sx={{ float: 'right', color: '#FF6F00' }} />
                    ) : (
                      <ArrowCircleUpIcon sx={{ float: 'right', color: '#FF6F00' }} />
                    )}
                  </td>
                </tr>
                {!collapsedGroups[grpId] &&
                  (cameras || []).map((row) => (
                    <tr
                      key={row.cam_seq}
                      onClick={() => {
                        openCameraDrawer(row);
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>
                        <span
                          className='inline-block rounded-sm text-white px-2 py-1'
                          style={{
                            backgroundColor: camerautils.statColor(row?.cam_stat),
                          }}
                        >
                          <CdIdLabel grp='CS' id={row?.cam_stat} />
                        </span>
                      </td>
                      <td style={{ textAlign: 'left' }}>{strutils.truncate(row?.cam_nm, 20)}</td>
                      <td>
                        <RoomIcon
                          sx={{ '&:hover': { color: 'red', cursor: 'pointer' } }}
                          onClick={(e) => {
                            e.stopPropagation();
                            moveMapPosition(row);
                          }}
                        />
                      </td>
                      <td>
                        <KeyboardArrowRightIcon
                          sx={{ '&:hover': { color: 'yellow', cursor: 'pointer' } }}
                          onClick={() => {
                            openCameraDrawer(row);
                          }}
                        />
                      </td>
                    </tr>
                  ))}
              </React.Fragment>
            ))}
          </tbody>
        </CustomTable>
      </CustomDrawer>
    </Box>
  );
});

DrawerCameraList.displayName = 'DrawerCameraList';
export const useDrawerCameraList = () => useRefComponent<Props>(DrawerCameraList);

export const useDrawerCameraListStore = create<{
  setRef: (v: React.RefObject<Props> | null) => void;
  ref: React.RefObject<Props> | null;
}>((set) => ({
  setRef: (v: React.RefObject<Props> | null) => set({ ref: v }),
  ref: null,
}));
