import { useDrawerEbrdStore } from '@/app/(admin)/comp/drawer/ebrd/DrawerEbrd';
import { CdIdLabel } from '@/app/(admin)/comp/input/CdIdLabel';
import * as maputils from '@/utils/map-utils';
import * as strutils from '@/utils/str-utils';
import * as ebrdutils from '@/utils/ebrd-utils';
import * as grputils from '@/utils/grp-utils';
import { isEbrdStat, useWsMsg } from '@/app/ws/useWsMsg';
import { useRefComponent } from '@/hooks/useRefComponent';
import { IfTbEbrd } from '@/models/ebrd/tb_ebrd';
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
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import React, { useState } from 'react';
import { create } from 'zustand';
import { useEbrdList } from '@/hooks/useDevList';
import { useMobile } from '@/hooks/useMobile';
import { CustomDrawer, DrawerHeader, CustomTable } from '@/app/(admin)/comp/drawer/StyledDrawer';
import FolderSharedIcon from '@mui/icons-material/FolderShared';
import ArrowCircleDownIcon from '@mui/icons-material/ArrowCircleDown';
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';
import { GrpLabel } from '@/app/(admin)/comp/input/GrpLabel';

type Props = {
  open: () => void;
  close: () => void;
  isOpened: boolean;
};

export const DrawerEbrdList = React.forwardRef<Props, unknown>((props, ref) => {
  const [open, setOpen] = useState<boolean>(false);
  const { map } = mapStore();
  const { ref: refDrawer } = useDrawerEbrdStore();
  const [keyword, setKeyword] = useState<string>('');
  const [tmpKeyword, setTmpKeyword] = useState<string>('');
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const { data: list, mutate } = useEbrdList();
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

  const openEbrdDrawer = (row: IfTbEbrd) => {
    refDrawer?.current?.open(row);
  };

  const moveMapPosition = (row: IfTbEbrd) => {
    maputils.moveMap(map, [row.ebrd_lng, row.ebrd_lat]);
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
    if (isEbrdStat(msg)) {
      mutate();
    }
  });

  const filteredList = (list || []).filter((ele) =>
    !!keyword ? ele.ebrd_nm?.includes(keyword) : true
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
        <DrawerHeader sx={{ display: 'flex', position: 'sticky', top: 0, zIndex: 100 }}>
          <ListAltIcon sx={{ color: '#ffffff' }} />
          <div style={{ marginRight: 'auto', paddingLeft: '10px' }}>
            <Typography variant='h5' sx={{ color: '#ffffff' }}>
              전광판 목록
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
          <colgroup>
            <col style={{ width: '20%' }} />
            <col style={{ width: '60%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '10%' }} />
          </colgroup>
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
            {Object.entries(grouped).map(([grpId, ebrds]) => (
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
                  (ebrds || []).map((row) => (
                    <tr
                      key={row.ebrd_seq}
                      onClick={() => openEbrdDrawer(row)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>
                        <span
                          className='inline-block rounded-sm text-white px-2 py-1'
                          style={{
                            backgroundColor: ebrdutils.ebrdStatColor(row?.comm_stat),
                          }}
                        >
                          <CdIdLabel grp='CS' id={row?.comm_stat} />
                        </span>
                      </td>
                      <td style={{ textAlign: 'left' }}>{strutils.truncate(row?.ebrd_nm, 20)}</td>
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
                            openEbrdDrawer(row);
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

DrawerEbrdList.displayName = 'DrawerEbrdList';
export const useDrawerEbrdList = () => useRefComponent<Props>(DrawerEbrdList);

export const useDrawerEbrdListStore = create<{
  setRef: (v: React.RefObject<Props> | null) => void;
  ref: React.RefObject<Props> | null;
}>((set) => ({
  setRef: (v: React.RefObject<Props> | null) => set({ ref: v }),
  ref: null,
}));
