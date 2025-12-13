import { useDrawerGateStore } from '@/app/(admin)/comp/drawer/DrawerGate';
import { CdIdLabel } from '@/app/(admin)/comp/input/CdIdLabel';
import { CdIdCombo } from '@/app/(admin)/comp/input/CdIdCombo';
import { GateGrpCombo } from '@/app/(admin)/comp/input/GateGrpCombo';
import * as maputils from '@/utils/map-utils';
import * as gateutils from '@/utils/gate-utils';
import * as strutils from '@/utils/str-utils';
import * as grputils from '@/utils/grp-utils';
import { useDlgControlGate } from '@/app/(admin)/comp/popup/DlgControlGate';
import { isGateCmd, isGateStat, useWsMsg } from '@/app/ws/useWsMsg';
import { useRefComponent } from '@/hooks/useRefComponent';
import { IfTbGate } from '@/models/gate/tb_gate';
import { mapStore } from '@/store/mapStore';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import ListAltIcon from '@mui/icons-material/ListAlt';
import RoomIcon from '@mui/icons-material/Room';
import SearchIcon from '@mui/icons-material/Search';
import { FormControl } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import useSWR from 'swr';
import { create } from 'zustand';
import { useGateList } from '@/hooks/useDevList';
import { useMobile } from '@/hooks/useMobile';
import { CustomDrawer, DrawerHeader, CustomTable } from '@/app/(admin)/comp/drawer/StyledDrawer';
import FolderSharedIcon from '@mui/icons-material/FolderShared';
import ArrowCircleDownIcon from '@mui/icons-material/ArrowCircleDown';
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';
import { GrpLabel } from '@/app/(admin)/comp/input/GrpLabel';
import clsx from 'clsx';

const labelBoxStyle = {
  background: 'linear-gradient(135deg, #E8F0FE 0%, #F0F7FF 100%)',
  border: 'none',
  color: '#33489c',
  fontWeight: '600',
  minWidth: '100px',
  height: '32px',
  borderRadius: '4px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.875rem',
  px: 1.5,
  boxShadow: '0 2px 4px rgba(51, 72, 156, 0.1)',
  '&:hover': {
    background: 'linear-gradient(135deg, #E0E8FF 0%, #E8F0FE 100%)',
  },
};

const formControlStyle = {
  '& .MuiOutlinedInput-root': {
    height: '32px',
    backgroundColor: '#fff',
    '& fieldset': {
      borderColor: '#E5E9F0',
    },
    '&:hover fieldset': {
      borderColor: '#33489c',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#33489c',
      borderWidth: '1px',
    },
  },
  '& .MuiSelect-select': {
    padding: '4px 14px',
    fontSize: '0.875rem',
  },
};

type Props = {
  open: () => void;
  close: () => void;
  isOpened: boolean;
};

export const DrawerGateList = React.forwardRef<Props, unknown>((props, ref) => {
  const [open, setOpen] = useState<boolean>(false);
  const [checkItems, setCheckItems] = useState<IfTbGate[]>([]);
  const [dlgControlGate, DlgControlGate] = useDlgControlGate();
  const { map } = mapStore();
  const { ref: refDrawer } = useDrawerGateStore();
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [searchKeywordApi, setSearchKeywordApi] = useState<string>('');
  const [searchList, setSearchList] = useState<IfTbGate[]>([]);
  const { data: gates, mutate: mutateGateList } = useGateList(open);
  const { data: srchs } = useSWR<IfTbGate[]>(
    open && !!searchKeywordApi && [`/api/gate/searchlist?gateNm=${searchKeywordApi}`]
  );
  const [selGroupSeq, setSelGroupSeq] = useState<string>('');
  const [selGateType, setSelGateType] = useState<string>('');
  const { data: groupGates } = useSWR<IfTbGate[]>(
    open && !!selGroupSeq && [`/api/gate/grouplist?grpSeq=${selGroupSeq}`]
  );
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const { isMobile } = useMobile();

  useEffect(() => {
    setCheckItems([]);

    if (searchKeywordApi) {
      setSearchList(srchs || []);
      return;
    }
    if (selGroupSeq) {
      setSearchList(groupGates || []);
      return;
    }
    setSearchList(gates || []);
  }, [gates, srchs, searchKeywordApi, groupGates, selGroupSeq]);

  const handleSearch = () => {
    setSearchKeywordApi(searchKeyword);
    if (selGroupSeq) {
      setSelGroupSeq('');
    }
  };

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
    setCheckItems([]);
    // setSelGroupSeq('');
    // setSelGateType('');
  };

  // 상세보기
  const openGateDrawer = (row: IfTbGate) => {
    refDrawer?.current?.open(row);
  };

  // 맵으로 위치 이동
  const moveMapPosition = (row: IfTbGate) => {
    maputils.moveMap(map, [row.gate_lng, row.gate_lat]);
  };

  const handleClickPopOpen = () => {
    if (checkItems.length === 0) {
      toast.error('한개 이상의 게이트를 선택해주세요.');
      return;
    }
    const filteredItems = checkItems.filter(
      (item) => !selGateType || item.gate_type === selGateType
    );
    dlgControlGate.current?.show(filteredItems);
  };

  const filteredList = (searchList || []).filter(
    (ele) =>
      (!!searchKeywordApi ? ele.gate_nm?.includes(searchKeywordApi) : true) &&
      (!!selGateType ? ele.gate_type === selGateType : true)
  );

  const grouped = grputils.groupByDevice(filteredList, (row) => row.grp_id);

  const toggleGroup = (grpId: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [grpId]: !prev[grpId],
    }));
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
    if (isGateStat(msg) || isGateCmd(msg)) {
      mutateGateList();
    }
  });

  return (
    <Box sx={{ display: 'flex' }}>
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
              차단장비 목록
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
            id='input-with-icon-textfield'
            label='검색어 입력'
            value={searchKeyword}
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
            onChange={(e) => setSearchKeyword(e.target.value)}
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
          sx={{
            display: 'flex',
            padding: '10px',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Box sx={{ ...labelBoxStyle, width: '150px' }}>차단장비그룹</Box>
          <FormControl fullWidth size='small' sx={formControlStyle}>
            <GateGrpCombo
              value={selGroupSeq}
              onChange={(value) => {
                setSelGroupSeq(value);
                if (searchKeyword || searchKeywordApi) {
                  setSearchKeywordApi('');
                  setSearchKeyword('');
                }
              }}
              open={open}
            />
          </FormControl>
        </Box>
        <Divider />
        <Box
          sx={{
            display: 'flex',
            padding: '10px',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Box sx={{ ...labelBoxStyle, width: '150px' }}>차단장비타입</Box>
          <FormControl fullWidth size='small' sx={formControlStyle}>
            <CdIdCombo
              value={selGateType}
              grp='GT'
              selectLabel='차단장비타입을 선택하세요'
              viewAll={true}
              onChange={(e) => {
                setSelGateType(e.target.value as string);
                if (searchKeyword || searchKeywordApi) {
                  setSearchKeywordApi('');
                  setSearchKeyword('');
                }
              }}
            />
          </FormControl>
        </Box>
        <Divider />
        <Grid container spacing={2} sx={{ padding: '8px' }}>
          <Grid size={8}>
            <label>
              <Checkbox
                onChange={(e) => {
                  if (e.target.checked) {
                    setCheckItems(searchList || []);
                  } else {
                    setCheckItems([]);
                  }
                }}
                checked={checkItems.length === searchList.length && searchList.length > 0}
              />
              전체 선택/해제
            </label>
          </Grid>
          <Grid
            size={4}
            sx={{
              display: 'flex',
              justifyContent: 'right',
              alignItems: 'right',
            }}
          >
            <Button variant='outlined' color='info' onClick={() => handleClickPopOpen()}>
              제어
            </Button>
          </Grid>
        </Grid>
        <Divider />
        <CustomTable>
          <colgroup>
            <col style={{ width: '10%' }} />
            <col style={{ width: '20%' }} />
            <col style={{ width: '50%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '10%' }} />
          </colgroup>
          <thead></thead>
          <tbody>
            {Object.entries(grouped).map(([grpId, gates]) => (
              <React.Fragment key={grpId}>
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      fontWeight: 'bold',
                      textAlign: 'left',
                      color: '#33489c',
                      cursor: 'pointer',
                      position: 'relative',
                    }}
                  >
                    <Checkbox
                      checked={gates.every((gate) =>
                        checkItems.some((v) => v.gate_seq === gate.gate_seq)
                      )}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setCheckItems([
                            ...checkItems,
                            ...gates.filter(
                              (gate) => !checkItems.some((v) => v.gate_seq === gate.gate_seq)
                            ),
                          ]);
                        } else {
                          setCheckItems(
                            checkItems.filter(
                              (gate) => !checkItems.some((v) => v.gate_seq === gate.gate_seq)
                            )
                          );
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span onClick={() => toggleGroup(grpId)}>
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
                    </span>
                  </td>
                </tr>
                {!collapsedGroups[grpId] &&
                  (gates || []).map((row) => (
                    <tr
                      key={row.gate_seq}
                      className={clsx('cursor-pointer', {
                        'bg-blue-200': checkItems.some((v) => v.gate_seq === row.gate_seq),
                      })}
                      onClick={() => {
                        if (checkItems.some((v) => v.gate_seq === row.gate_seq)) {
                          setCheckItems(checkItems.filter((ele) => ele.gate_seq !== row.gate_seq));
                        } else {
                          setCheckItems([...checkItems, row]);
                        }
                      }}
                    >
                      <td>
                        <Checkbox checked={checkItems.some((v) => v.gate_seq === row.gate_seq)} />
                      </td>
                      <td className='nopadwidth'>
                        <span
                          className='inline-block rounded-sm text-white px-2 py-1'
                          style={{
                            backgroundColor: gateutils.gateStatColor(row?.gate_stat || ''),
                          }}
                        >
                          <CdIdLabel grp='GS' id={row?.gate_stat} />
                        </span>
                      </td>
                      <td className='nopadwidth'>{strutils.truncate(row?.gate_nm, 14)}</td>
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
                          onClick={(e) => {
                            e.stopPropagation();
                            openGateDrawer(row);
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
      <DlgControlGate />
    </Box>
  );
});

DrawerGateList.displayName = 'DrawerGateList';
export const useDrawerGateList = () => useRefComponent<Props>(DrawerGateList);

export const useDrawerGateListStore = create<{
  setRef: (v: React.RefObject<Props> | null) => void;
  ref: React.RefObject<Props> | null;
}>((set) => ({
  setRef: (v: React.RefObject<Props> | null) => set({ ref: v }),
  ref: null,
}));
