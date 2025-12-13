'use client';

import { SettingTitle } from '@/app/(admin)/settings/comp/SettingTitle';
import { IfTbAlmSett, TbAlmSett } from '@/models/tb_alm_sett';
import { IfTbAlmUser } from '@/models/tb_alm_user';
import { IfTbWater } from '@/models/water/tb_water';
import RestoreIcon from '@mui/icons-material/Restore';
import SaveIcon from '@mui/icons-material/Save';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import {
  Box,
  Button,
  Card,
  Checkbox,
  Paper,
  SvgIcon,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import axios from 'axios';
import clsx from 'clsx';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { listStyles } from '@/app/(admin)/settings/comp/commStyles';
import { StyledCardActions } from '@/app/(admin)/settings/comp/StyledForm';

type Props = {
  list: IfTbWater[] | undefined;
  selUser: IfTbAlmUser;
};

export const AlmSett = ({ list, selUser }: Props) => {
  const [setts, setSetts] = useState<IfTbAlmSett[]>([]);

  const [mapSetts, setMapSetts] = useState<{ [key: number]: IfTbAlmSett }>({});

  useEffect(() => {
    // 사용자 목록 조회.
    const map = (setts || []).reduce<{ [key: number]: IfTbAlmSett }>((acc, cur) => {
      if (cur.water_seq) {
        acc[cur.water_seq] = cur;
      }
      return acc;
    }, {});
    setMapSetts(map);
  }, [setts, setMapSetts]);

  const getSetts = useCallback(() => {
    if (!selUser.alm_user_seq) {
      setSetts([]);
      return;
    }
    axios
      .get('/api/alm_sett/list', { params: { almUserSeq: selUser.alm_user_seq } })
      .then((res) => {
        setSetts(res.data);
      })
      .catch((e) => {
        console.error('E', e);
        setSetts([]);
      });
  }, [selUser.alm_user_seq]);

  useEffect(() => {
    getSetts();
  }, [getSetts, selUser.alm_user_seq]);

  const handleSave = () => {
    // 삭제후 저장하는 방식으로 처리 예정임.
    // 그래서, 변경된 것만 전송하면됨.
    if (!selUser.alm_user_seq) {
      toast.warning('사용자를 선택하여 주십시오');
      return;
    }

    const models: IfTbAlmSett[] = [];

    for (const [k, v] of Object.entries(mapSetts)) {
      console.log('k', k, 'v', v);
      if (!k) continue;
      if (
        v.sms_attn_yn !== 'Y' &&
        v.sms_warn_yn !== 'Y' &&
        v.sms_alert_yn !== 'Y' &&
        v.sms_crit_yn !== 'Y'
      ) {
        continue;
      }
      if (v.sms_attn_yn !== 'Y') v.sms_attn_yn = 'N';
      if (v.sms_warn_yn !== 'Y') v.sms_warn_yn = 'N';
      if (v.sms_alert_yn !== 'Y') v.sms_alert_yn = 'N';
      if (v.sms_crit_yn !== 'Y') v.sms_crit_yn = 'N';

      models.push(v);
    }
    // if (models.length === 0) {
    //   toast.warning('변경사항이 없습니다');
    //   return;
    // }

    axios
      .post('/api/alm_sett/saves', { list: models, almUserSeq: selUser.alm_user_seq })
      .then((res) => {
        console.log('success. ', res.data);
        toast.success('저장 하였습니다');
      })
      .catch((e) => {
        console.error('E', e);
        toast.error('실패 하였습니다');
      });
  };

  const handleReset = () => {
    getSetts();
  };

  return (
    <Card sx={listStyles.card}>
      <SettingTitle>
        <Box sx={listStyles.titleBox}>
          <SvgIcon fontSize='large'>
            <NotificationsActiveIcon />
          </SvgIcon>
        </Box>
        <Box>
          <Typography variant='h5' fontWeight={700} color='text.primary'>
            경보 SMS 설정
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={listStyles.titleText}>
            선택된 사용자에게 SMS 발송될 수위계별 경보알림 단계를 설정합니다.
          </Typography>
        </Box>
      </SettingTitle>

      <TableContainer component={Paper} sx={listStyles.tableContainer} className='scroll-table'>
        <Table sx={{ minWidth: 500 }} stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>이름</TableCell>
              <TableCell>관심</TableCell>
              <TableCell>주의</TableCell>
              <TableCell>경계</TableCell>
              <TableCell>심각</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(list || []).map((row) => (
              <TableRow
                key={row.water_seq}
                sx={listStyles.tableRowNoPadding}
                onClick={() => null}
                className={clsx({ sel: false })}
              >
                <TableCell>{row.water_nm}</TableCell>
                <TableCell>
                  <Checkbox
                    checked={mapSetts[row.water_seq || 0]?.sms_attn_yn === 'Y'}
                    onChange={(e) => {
                      let sett = mapSetts[row.water_seq || 0];
                      if (!sett) {
                        sett = new TbAlmSett();
                        sett.water_seq = row.water_seq;
                        sett.alm_user_seq = selUser.alm_user_seq;
                        mapSetts[row.water_seq || 0] = sett;
                      }
                      sett.sms_attn_yn = e.target.checked ? 'Y' : 'N';
                      setMapSetts({ ...mapSetts });
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Checkbox
                    checked={mapSetts[row.water_seq || 0]?.sms_warn_yn === 'Y'}
                    onChange={(e) => {
                      let sett = mapSetts[row.water_seq || 0];
                      if (!sett) {
                        sett = new TbAlmSett();
                        sett.water_seq = row.water_seq;
                        sett.alm_user_seq = selUser.alm_user_seq;
                        mapSetts[row.water_seq || 0] = sett;
                      }
                      sett.sms_warn_yn = e.target.checked ? 'Y' : 'N';
                      setMapSetts({ ...mapSetts });
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Checkbox
                    checked={mapSetts[row.water_seq || 0]?.sms_alert_yn === 'Y'}
                    onChange={(e) => {
                      let sett = mapSetts[row.water_seq || 0];
                      if (!sett) {
                        sett = new TbAlmSett();
                        sett.water_seq = row.water_seq;
                        sett.alm_user_seq = selUser.alm_user_seq;
                        mapSetts[row.water_seq || 0] = sett;
                      }
                      sett.sms_alert_yn = e.target.checked ? 'Y' : 'N';
                      setMapSetts({ ...mapSetts });
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Checkbox
                    checked={mapSetts[row.water_seq || 0]?.sms_crit_yn === 'Y'}
                    onChange={(e) => {
                      let sett = mapSetts[row.water_seq || 0];
                      if (!sett) {
                        sett = new TbAlmSett();
                        sett.water_seq = row.water_seq;
                        sett.alm_user_seq = selUser.alm_user_seq;
                        mapSetts[row.water_seq || 0] = sett;
                      }
                      sett.sms_crit_yn = e.target.checked ? 'Y' : 'N';
                      setMapSetts({ ...mapSetts });
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <StyledCardActions>
        <Button
          color='primary'
          onClick={handleSave}
          startIcon={<SaveIcon />}
          sx={listStyles.commButton}
        >
          저장
        </Button>
        <Button
          color='secondary'
          onClick={handleReset}
          startIcon={<RestoreIcon />}
          sx={listStyles.commButton}
        >
          초기화
        </Button>
      </StyledCardActions>
    </Card>
  );
};
