import { styled } from '@mui/material/styles';

export const SunnyEffect = () => {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <SunCircle />
    </div>
  );
};

const SunCircle = styled('div')({
  position: 'absolute',
  left: '50%',
  top: '-16px',
  transform: 'translate(-50%, -50%)',
  width: '60px',
  height: '60px',
  background: 'radial-gradient(circle, #FFD700, #FFA500)',
  borderRadius: '50%',
  boxShadow: '0 0 50px #FFD700',
  animation: 'pulse 2s ease-in-out infinite',
  '@keyframes pulse': {
    '0%': {
      transform: 'translate(-50%, -50%) scale(1)',
      boxShadow: '0 0 50px #FFD700',
    },
    '50%': {
      transform: 'translate(-50%, -50%) scale(1.1)',
      boxShadow: '0 0 70px #FFD700',
    },
    '100%': {
      transform: 'translate(-50%, -50%) scale(1)',
      boxShadow: '0 0 50px #FFD700',
    },
  },
});
