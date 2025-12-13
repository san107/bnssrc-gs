import { useDrawerWaterStore } from '@/app/(admin)/comp/drawer/DrawerWater';
import * as waterutils from '@/utils/water-utils';
import * as maputils from '@/utils/map-utils';
import * as grputils from '@/utils/grp-utils';
import { isWaterEvt, isWaterStat, useWsMsg } from '@/app/ws/useWsMsg';
import { useRefComponent } from '@/hooks/useRefComponent';
import { IfTbWater } from '@/models/water/tb_water';
import { mapStore } from '@/store/mapStore';
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
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import React, { useState } from 'react';
import { create } from 'zustand';
import { useWaterList } from '@/hooks/useDevList';
import { useMobile } from '@/hooks/useMobile';
import { CustomDrawer, DrawerHeader, CustomTable } from '@/app/(admin)/comp/drawer/StyledDrawer';
import FolderSharedIcon from '@mui/icons-material/FolderShared';
import ArrowCircleDownIcon from '@mui/icons-material/ArrowCircleDown';
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';
import { GrpLabel } from '@/app/(admin)/comp/input/GrpLabel';
import { CdIdLabel } from '@/app/(admin)/comp/input/CdIdLabel';

const WaterLevelBadge = styled(Box)(() => ({
  maxWidth: '60px',
  height: '28px',
  padding: '0 6px',
  borderRadius: '14px',
  color: 'white',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontWeight: 600,
  fontSize: '0.875rem',
  minWidth: '60px',
}));

type Props = {
  open: () => void;
  close: () => void;
  isOpened: boolean;
};

export const DrawerWaterList = React.forwardRef<Props, unknown>((props, ref) => {
  const [open, setOpen] = useState(false);
  const { map } = mapStore();
  const { ref: refDrawer } = useDrawerWaterStore();
  const [keyword, setKeyword] = useState<string>('');
  const [tmpKeyword, setTmpKeyword] = useState<string>('');
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const { data: list, mutate: mutateWaters } = useWaterList();
  const { isMobile } = useMobile();

  const handleSearch = () => {
    setKeyword(tmpKeyword);
  };

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
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
    if (isWaterEvt(msg)) {
      mutateWaters();
    } else if (isWaterStat(msg)) {
      mutateWaters();
    }
  });

  const openWaterDrawer = (row: IfTbWater) => {
    refDrawer?.current?.open(row);
  };

  const moveMapPosition = (row: IfTbWater) => {
    maputils.moveMap(map, [row.water_lng, row.water_lat]);
  };

  const filteredList = (list || []).filter((ele) =>
    !!keyword ? ele?.water_nm?.includes(keyword) : true
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
      <CustomDrawer
        variant='persistent'
        anchor='right'
        open={open}
        sx={{
          '& .MuiDrawer-paper': {
            width: isMobile ? '100%' : '360px',
          },
        }}
      >
        <DrawerHeader sx={{ display: 'flex' }}>
          <ListAltIcon sx={{ color: '#ffffff' }} />
          <div style={{ marginRight: 'auto', paddingLeft: '10px' }}>
            <Typography variant='h5' sx={{ color: '#ffffff' }}>
              수위계 목록
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
        <Box
          className='overflow-auto'
          sx={{
            height: 'calc(100vh - 180px)',
            touchAction: 'pan-y',
          }}
        >
          <CustomTable>
            <colgroup>
              <col style={{ width: '40%' }} />
              <col style={{ width: '40%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '10%' }} />
            </colgroup>
            <thead>
              <tr>
                <th>상태</th>
                <th>이름</th>
                <th>
                  <RoomIcon />
                </th>
                <th>
                  <KeyboardArrowRightIcon />
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(grouped).map(([grpId, waters]) => (
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
                    (waters || []).map((row) => (
                      <tr
                        key={row.water_seq}
                        onClick={() => openWaterDrawer(row)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <span
                              className='inline-block rounded-sm text-white px-2 py-1'
                              style={{
                                backgroundColor: waterutils.statColor(row?.comm_stat),
                              }}
                            >
                              <CdIdLabel grp='CS' id={row?.comm_stat} />
                            </span>
                            <WaterLevelBadge
                              sx={{ background: `${waterutils.waterLevelColor(row?.water_stat)}` }}
                            >
                              {row?.water_level}
                            </WaterLevelBadge>
                          </Box>
                        </td>
                        <td style={{ textAlign: 'left' }}>{row?.water_nm}</td>
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
                            onClick={() => openWaterDrawer(row)}
                          />
                        </td>
                      </tr>
                    ))}
                </React.Fragment>
              ))}
            </tbody>
          </CustomTable>
        </Box>
      </CustomDrawer>
    </Box>
  );
});

DrawerWaterList.displayName = 'DrawerWaterList';
export const useDrawerWaterList = () => useRefComponent<Props>(DrawerWaterList);

export const useDrawerWaterListStore = create<{
  setRef: (v: React.RefObject<Props | null> | null) => void;
  ref: React.RefObject<Props | null> | null;
}>((set) => ({
  setRef: (v: React.RefObject<Props | null> | null) => set({ ref: v }),
  ref: null,
}));
