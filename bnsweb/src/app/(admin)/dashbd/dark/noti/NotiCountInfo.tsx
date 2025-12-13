import { Box, List, ListItemButton, ListItemText } from '@mui/material';
import React from 'react';

type Props = {
  title?: string;
  list?: string[];
  callback?: () => void;
};

const NotiCountInfo = ({ title, list, callback }: Props) => {
  return (
    <div className='form-count-container' id='form-count-container'>
      <div className='noti-count-header'>
        <span className='icon icon-small-close' id='notification-close' onClick={callback}></span>
        {title} 목록
      </div>
      <Box sx={{ padding: '20px' }}>
        <List>
          {list && list?.length > 0 ? (
            (list || []).map((row, idx) => (
              <ListItemButton key={idx}>
                <ListItemText primary={row} />
              </ListItemButton>
            ))
          ) : (
            <ListItemText primary={'해당 항목이 없습니다.'} sx={{ textAlign: 'center' }} />
          )}
        </List>
      </Box>
    </div>
  );
};

export default NotiCountInfo;
