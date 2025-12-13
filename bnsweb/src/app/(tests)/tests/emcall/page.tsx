'use client';

import { useEmcallList } from '@/hooks/useDevList';
import { IfTbEmcall } from '@/models/emcall/tb_emcall';
import { Box, Button, MenuItem, Select, Typography } from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function EmcallPage() {
  const { data: emcalls } = useEmcallList();

  const [sel, setSel] = useState<IfTbEmcall | null>(null);

  const servers = ['http://localhost:3010', 'http://bisansoft.iptime.org:3010'];
  const [server, setServer] = useState<string>(servers[0]);

  const events = ['B_PUSH', 'B_START', 'B_STOP', 'B_ALIVE', 'S1_ON', 'S1_OFF'];
  const [event, setEvent] = useState<string>(events[0]);

  const [url, setUrl] = useState<string>('');
  useEffect(() => {
    setUrl(`${server}/api/public/itg/event`);
  }, [server, event]);
  const [req, setReq] = useState<{ device_id: string; event_type: string }>({
    device_id: '',
    event_type: '',
  });
  useEffect(() => {
    setReq({ device_id: sel?.emcall_id || '', event_type: event });
  }, [sel, event]);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant='h5'>비상통화장치 목록</Typography>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: 1 }}>
            <h3>목록</h3>
            {emcalls?.map((emcall) => (
              <Box key={emcall.emcall_id} sx={{ mb: 1 }}>
                <Button
                  variant={sel?.emcall_id === emcall.emcall_id ? 'contained' : 'outlined'}
                  fullWidth
                  onClick={() => setSel(emcall)}
                  color={sel?.emcall_id === emcall.emcall_id ? 'success' : 'primary'}
                >
                  {emcall.emcall_seq} : {emcall.emcall_id}
                </Button>
              </Box>
            ))}
          </Box>
        </Box>

        <Box sx={{ flex: 1 }}>
          <Box sx={{ p: 2, border: '1px solid #ccc', borderRadius: 1 }}>
            <h3>API 전송</h3>

            {sel && (
              <>
                <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column' }}>
                  <Box>
                    선택 : {sel.emcall_id} {sel.emcall_nm} {sel.emcall_seq}
                  </Box>
                  <Box>선택서버 : {server}</Box>
                </Box>
                <Select
                  value={server}
                  onChange={(e) => setServer(e.target.value)}
                  label='서버 선택'
                >
                  {servers.map((s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </Select>
                <Select
                  value={event}
                  onChange={(e) => setEvent(e.target.value)}
                  label='이벤트 선택'
                >
                  {events.map((e) => (
                    <MenuItem key={e} value={e}>
                      {e}
                    </MenuItem>
                  ))}
                </Select>

                <div>이벤트 URL : {url}</div>
                <div>{JSON.stringify(req)}</div>
                <Button
                  variant='outlined'
                  fullWidth
                  onClick={() => {
                    axios
                      .post(url, req)
                      .then((res) => toast.success('전송완료' + JSON.stringify(res.data)))
                      .catch((err) => toast.error('전송실패' + JSON.stringify(err)));
                  }}
                >
                  이벤트 전송
                </Button>
              </>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
