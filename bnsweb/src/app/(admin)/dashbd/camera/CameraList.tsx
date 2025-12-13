'use client';

import { CdIdLabel } from '@/app/(admin)/comp/input/CdIdLabel';
import { isCameraCmd, isCameraStat, useWsMsg } from '@/app/ws/useWsMsg';
import { useRefComponent } from '@/hooks/useRefComponent';
import { IfTbCamera } from '@/models/tb_camera';
import { camerautils } from '@/utils/camera-utils';
import * as strutils from '@/utils/str-utils';
import * as grputils from '@/utils/grp-utils';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import CloseIcon from '@mui/icons-material/Close';
import ListAltIcon from '@mui/icons-material/ListAlt';
import SearchIcon from '@mui/icons-material/Search';
import FolderSharedIcon from '@mui/icons-material/FolderShared';
import ArrowCircleDownIcon from '@mui/icons-material/ArrowCircleUp';
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleDown';
import { Checkbox } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import useSWR from 'swr';
import { create } from 'zustand';
import { useLoginInfo } from '@/app/(admin)/leftmenu/useLoginInfo';
import { GrpLabel } from '@/app/(admin)/comp/input/GrpLabel';
import {
  CustomDrawer,
  DrawerHeader,
  CustomTable,
  CustomChip,
} from '@/app/(admin)/comp/drawer/StyledDrawer';

export type RefProps = {
  open: () => void;
  close: () => void;
  isOpened: boolean;
  toggle: () => void;
};

const Expand = styled((props: IconButtonProps & { expand: boolean }) => {
  const { expand, ...other } = props;
  return <IconButton disableFocusRipple={expand} {...other} />;
})(({ theme, expand }) => ({
  transform: expand ? 'rotate(180deg)' : 'rotate(0deg)',
  marginLeft: 'auto',
  pointerEvents: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

type Props = {
  checks: IfTbCamera[];
  setChecks: (a: IfTbCamera[]) => void;
};

export const CameraList = React.forwardRef<RefProps, Props>(
  ({ checks, setChecks, ..._props }, ref) => {
    const [open, setOpen] = useState<boolean>(false);
    const [keyword, setKeyword] = useState<string>('');
    const [tmpKeyword, setTmpKeyword] = useState<string>('');
    const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
    const { login } = useLoginInfo();
    const { data: list, mutate } = useSWR<IfTbCamera[]>(
      login?.grp_id && open ? [`/api/camera/childlist?grpId=${login?.grp_id}`] : undefined
    );

    useEffect(() => {
      setOpen(true);
    }, []);

    const handleSearch = () => {
      setKeyword(tmpKeyword);
    };

    const handleDrawerOpen = () => {
      setOpen(true);
    };

    const handleDrawerClose = () => {
      setOpen(false);
    };

    const toggleGroup = (grpId: string) => {
      setCollapsedGroups((prev) => ({
        ...prev,
        [grpId]: !prev[grpId],
      }));
    };

    React.useImperativeHandle<RefProps, RefProps>(
      ref,
      (): RefProps => ({
        open: () => {
          handleDrawerOpen();
        },
        close: () => {
          handleDrawerClose();
        },
        isOpened: open,
        toggle: () => {
          setOpen(!open);
        },
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

    return (
      <Box sx={{ display: 'flex', overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
        <Handle className={clsx({ hide: open })}>
          <Expand expand={false} onClick={() => setOpen(!open)}>
            <ChevronLeftIcon
              sx={{
                color: '#fff',
                backgroundColor: '#1976d2',
                '&:hover': {
                  background: '#4e9ef8',
                },
                borderRadius: '50%',
              }}
            />
          </Expand>
        </Handle>
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
          <Box display={'flex'} sx={{ padding: '0 16px 0 10px' }}>
            <label>
              <Checkbox
                onChange={(e) => {
                  if (e.target.checked) {
                    setChecks(list?.slice(0) || []);
                  } else {
                    setChecks([]);
                  }
                }}
              />
              전체 선택
            </label>
            <Box flexGrow={1} />
            <CustomChip
              label='전체 카메라 닫기'
              onClick={() => setChecks([])}
              deleteIcon={<CloseIcon sx={{ color: '#1976d2 !important', fontSize: '1rem' }} />}
              onDelete={() => setChecks([])}
            />
          </Box>
          <Divider sx={{ marginTop: '2px' }} />

          <CustomTable>
            <thead>
              <tr>
                {['상태', '이름', 'v'].map((ele, idx) => (
                  <th key={idx}>{ele}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(grouped).map(([grpId, cameras]) => (
                <React.Fragment key={grpId}>
                  <tr>
                    <td
                      colSpan={3}
                      style={{
                        fontWeight: 'bold',
                        textAlign: 'left',
                        paddingLeft: '10px',
                        color: '#33489c',
                        cursor: 'pointer',
                        position: 'relative',
                      }}
                      onClick={() => toggleGroup(grpId)}
                    >
                      <Checkbox
                        checked={cameras.every((cam) =>
                          checks.some((v) => v.cam_seq === cam.cam_seq)
                        )}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setChecks([
                              ...checks,
                              ...cameras.filter(
                                (cam) => !checks.some((v) => v.cam_seq === cam.cam_seq)
                              ),
                            ]);
                          } else {
                            setChecks(
                              checks.filter(
                                (cam) => !cameras.some((v) => v.cam_seq === cam.cam_seq)
                              )
                            );
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <FolderSharedIcon sx={{ marginRight: '10px', verticalAlign: 'middle' }} />
                      <GrpLabel grpId={grpId} />
                      <span
                        style={{
                          position: 'absolute',
                          right: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                        }}
                      >
                        {collapsedGroups[grpId] ? (
                          <ArrowCircleDownIcon sx={{ color: '#FF6F00' }} />
                        ) : (
                          <ArrowCircleUpIcon sx={{ color: '#FF6F00' }} />
                        )}
                      </span>
                    </td>
                  </tr>
                  {!collapsedGroups[grpId] &&
                    cameras.map((row) => (
                      <tr
                        key={row.cam_seq}
                        className={clsx('cursor-pointer', {
                          'bg-blue-50': checks.some((v) => v.cam_seq === row.cam_seq),
                        })}
                        onClick={() => {
                          if (checks.some((v) => v.cam_seq === row.cam_seq)) {
                            setChecks(checks.filter((ele) => ele.cam_seq !== row.cam_seq));
                          } else {
                            setChecks([...checks, row]);
                          }
                        }}
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
                          <Checkbox checked={checks.some((v) => v.cam_seq === row.cam_seq)} />
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
  }
);

CameraList.displayName = 'CameraList';
export const useCameraList = () => useRefComponent<RefProps>(CameraList);

export const useCameraListStore = create<{
  setRef: (v: React.RefObject<RefProps> | null) => void;
  ref: React.RefObject<RefProps> | null;
}>((set) => ({
  setRef: (v: React.RefObject<RefProps> | null) => set({ ref: v }),
  ref: null,
}));

const Handle = styled(Box)`
  position: absolute;
  right: 10px;
  top: 10px;
  &.hide {
    display: none;
  }
`;
