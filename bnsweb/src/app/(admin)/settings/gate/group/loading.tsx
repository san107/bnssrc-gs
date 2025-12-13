import React from 'react';
import CustomLoading from '@/app/(admin)/comp/utils/CustomLoading';
import { Box } from '@mui/material';

const Loading = () => {
  return (
    <Box sx={{ margin: 'auto' }}>
      <CustomLoading />
    </Box>
  );
};

export default Loading;
