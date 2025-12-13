// @flow
import { ArrowLeft } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';
import Link from 'next/link';

type Props = {};
const NotFound = (_props: Props) => {
  return (
    <Box component={'div'} sx={{ textAlign: 'center', margin: '100px' }}>
      <Typography variant='h6' sx={{ margin: 2 }}>
        Not Found(404)
      </Typography>
      <Link href={'/'}>
        <ArrowLeft />
        홈으로
      </Link>
    </Box>
  );
};

export default NotFound;
