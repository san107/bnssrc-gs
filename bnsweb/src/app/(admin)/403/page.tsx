'use client';

import { Box, Typography, Button } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function ForbiddenPage() {
  const router = useRouter();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: 2,
      }}
    >
      <Typography variant='h1' color='error'>
        403
      </Typography>
      <Typography variant='h5'>접근 권한이 없습니다.</Typography>
      <Typography variant='body1' color='text.secondary'>
        이 기능은 현재 비활성화되어 있습니다. 관리자에게 문의 바랍니다.
      </Typography>
      <Button variant='contained' onClick={() => router.push('/')} sx={{ mt: 2 }}>
        홈으로 돌아가기
      </Button>
    </Box>
  );
}
