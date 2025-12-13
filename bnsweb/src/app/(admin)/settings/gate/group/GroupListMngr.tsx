// @flow
import { useConfirm } from '@/app/(admin)/comp/popup/DlgConfirm';
import { SettingBtn } from '@/app/(admin)/settings/alm/SettingBtn';
import { SettingTitle } from '@/app/(admin)/settings/comp/SettingTitle';
import { StyledBox, StyledCard, StyledCardActions } from '@/app/(admin)/settings/comp/StyledForm';
import GroupInGate from '@/app/(admin)/settings/gate/group/GroupInGate';
import { useGateList } from '@/hooks/useDevList';
import { IfTbGate } from '@/models/gate/tb_gate';
import { IfTbGroup, TbGroup } from '@/models/tb_group';
import DriveFileMoveIcon from '@mui/icons-material/DriveFileMove';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import {
  Box,
  Button,
  Card,
  CardHeader,
  Checkbox,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  SvgIcon,
  Typography,
} from '@mui/material';
import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useSWRConfig } from 'swr';

type Props = {
  sel: IfTbGroup;
  setSel: (v: IfTbGroup) => void;
};

function exist(a: readonly IfTbGate[], b: readonly IfTbGate[]) {
  const exist = a.some((item) => b.some((i) => i?.gate_seq === item?.gate_seq));
  if (exist) {
    toast.error('같은 그룹 목록이 존재합니다.');
    return true;
  }
  return false;
}

function not(a: readonly IfTbGate[], b: readonly IfTbGate[]) {
  return a.filter((value) => !b.includes(value));
}

function notObj(a: readonly IfTbGate[], b: readonly IfTbGate[]) {
  return b.filter((item) => !a.some((i) => i.gate_seq === item.gate_seq));
}

function intersection(a: readonly IfTbGate[], b: readonly IfTbGate[]) {
  return a.filter((value) => b.includes(value));
}

function union(a: readonly IfTbGate[], b: readonly IfTbGate[]) {
  return [...a, ...not(b, a)];
}

export const GroupListMngr = ({ sel, setSel }: Props) => {
  const { mutate } = useSWRConfig();
  const { data: list } = useGateList();

  const [checked, setChecked] = useState<readonly IfTbGate[]>([]);
  const [left, setLeft] = useState<readonly IfTbGate[]>([]);
  const [right, setRight] = useState<readonly IfTbGate[]>([]);

  const initDataLoad = useCallback(async () => {
    if (!sel?.grp_seq) {
      setLeft([]);
      setRight([]);
      return;
    }
    // console.log('grp_seq', sel.grp_seq);

    // const leftList = await fetch('/api/gate/list');
    // const leftList = await fetch('/api/gate/notgrouplist');
    // const leftData = await leftList.json();
    const leftData = list || [];
    setLeft(leftData);

    // const rightList = await fetch(`/api/group_el/list?grpSeq=${sel.grp_seq}`);
    const rightList = await fetch(`/api/gate/grouplist?grpSeq=${sel.grp_seq}`);
    const rightData = await rightList.json();
    setRight(rightData);
  }, [sel.grp_seq, list]);

  useEffect(() => {
    initDataLoad();
  }, [initDataLoad, sel]);

  const leftChecked = intersection(checked, left);
  const rightChecked = intersection(checked, right);

  const handleToggle = (value: IfTbGate) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

  const numberOfChecked = (items: readonly IfTbGate[]) => intersection(checked, items).length;

  const handleToggleAll = (items: readonly IfTbGate[]) => () => {
    if (numberOfChecked(items) === items.length) {
      setChecked(not(checked, items));
    } else {
      setChecked(union(checked, items));
    }
  };

  const handleCheckedRight = () => {
    if (!exist(right, leftChecked)) {
      setRight(right.concat(leftChecked));
      setLeft(not(left, leftChecked));
      setChecked(not(checked, leftChecked));
    }
  };

  const handleCheckedLeft = () => {
    setLeft(left.concat(notObj(left, rightChecked)));
    setRight(not(right, rightChecked));
    setChecked(not(checked, rightChecked));
  };

  const customList = (title: React.ReactNode, items: readonly IfTbGate[], gubun?: string) => (
    <Card sx={{ height: '100%' }}>
      <CardHeader
        sx={{ px: 2, py: 1, bgcolor: '#eeeeee' }}
        avatar={
          <Checkbox
            onClick={handleToggleAll(items)}
            checked={numberOfChecked(items) === items.length && items.length !== 0}
            indeterminate={numberOfChecked(items) !== items.length && numberOfChecked(items) !== 0}
            disabled={items.length === 0}
            aria-label='all items selected'
          />
        }
        title={title}
        subheader={`${numberOfChecked(items)}/${items.length} selected`}
      />
      <Divider />
      <List
        sx={{
          width: '100%',
          height: { xs: 300, md: '100%' },
          bgcolor: gubun === 'sel' ? '#eeeeff' : 'background.paper',
          overflow: 'auto',
          p: 0,
        }}
        dense
        component='div'
        role='list'
      >
        {items &&
          items.map((item: IfTbGate) => {
            const labelId = `transfer-list-all-item-${item?.gate_seq}-label`;
            return (
              <React.Fragment key={item?.gate_seq}>
                <div className='group-in-gate' onClick={handleToggle(item)}>
                  <GroupInGate gate={item} />
                  <ListItem role='listitem' sx={{ p: 0 }}>
                    <ListItemIcon>
                      <Checkbox
                        checked={checked.includes(item)}
                        tabIndex={-1}
                        disableRipple
                        aria-labelledby={labelId}
                      />
                    </ListItemIcon>
                    <ListItemText id={labelId}>{item?.gate_nm}</ListItemText>
                  </ListItem>
                  <Divider />
                </div>
              </React.Fragment>
            );
          })}
      </List>
    </Card>
  );

  const confirm = useConfirm();
  const handleSave = () => {
    if (right.length === 0) {
      toast.error('최소 1개 이상 목록을 선택해주세요.');
      return;
    }

    confirm('확인', ['저장하시겠습니까'])
      ?.then(() => {
        const grpEls = right.map((item) => {
          return { grp_seq: sel.grp_seq, grp_el_seq: item.gate_seq };
        });
        // console.log('grpEls', grpEls);
        axios
          .post('/api/group_el/save', { list: grpEls, grpSeq: sel.grp_seq })
          .then((_res) => {
            setSel(new TbGroup());
            // setSel(sel);
            mutate(() => true);
            toast.success('저장하였습니다');
            mutate(() => true);
          })
          .catch((e) => {
            console.error('E', e);
            toast.error('실패하였습니다.(error : ' + e?.message + ')');
          });
      })
      .catch((e) => {
        // 취소
        console.log('취소. ', e);
      });
  };

  return (
    <StyledCard sx={{ overflowY: 'hidden' }}>
      <SettingTitle>
        <StyledBox>
          <SvgIcon fontSize='large'>
            <DriveFileMoveIcon />
          </SvgIcon>
        </StyledBox>
        <Box>
          <Typography variant='h5' fontWeight={700} color='text.primary'>
            차단장비그룹 목록 관리
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            차단장비그룹에 속한 차단장비 목록을 관리합니다.
          </Typography>
        </Box>
      </SettingTitle>

      <Box sx={{ mt: 3 }} />
      <Box sx={{ mb: 3, flexGrow: 1, height: { xs: '100%', md: '100px' } }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 2,
            width: '100%',
            height: '100%',
          }}
        >
          <Box sx={{ flex: 1, height: '100%' }}>
            {customList(
              '미등록 차단장비 목록',
              left.filter((left) => !right.find((right) => right.gate_seq === left.gate_seq))
            )}
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'row', md: 'column' },
              justifyContent: 'center',
              alignItems: 'center',
              gap: 1,
              my: { xs: 2, md: 0 },
              minWidth: { xs: '100%', md: '80px' },
            }}
          >
            <Button
              variant='outlined'
              size='small'
              onClick={handleCheckedRight}
              disabled={leftChecked.length === 0}
              aria-label='move selected right'
            >
              <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <KeyboardArrowRightIcon />
              </Box>
              <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                <KeyboardArrowDownIcon />
              </Box>
            </Button>
            <Button
              variant='outlined'
              size='small'
              onClick={handleCheckedLeft}
              disabled={rightChecked.length === 0}
              aria-label='move selected left'
            >
              <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <KeyboardArrowLeftIcon />
              </Box>
              <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                <KeyboardArrowUpIcon />
              </Box>
            </Button>
          </Box>
          <Box sx={{ flex: 1, height: '100%' }}>
            {customList('등록된 차단장비 목록', right, 'sel')}
          </Box>
        </Box>
      </Box>

      <StyledCardActions>
        <SettingBtn btnType='save' onClick={handleSave} disabled={!sel?.grp_seq}>
          저장
        </SettingBtn>
      </StyledCardActions>
    </StyledCard>
  );
};
