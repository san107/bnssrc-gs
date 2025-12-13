import { Chip, Drawer as MuiDrawer, DrawerProps, Table } from '@mui/material';
import { styled } from '@mui/material/styles';

export const CustomDrawer = styled(MuiDrawer)<DrawerProps>(() => ({
  '& .MuiDrawer-paper': {
    width: 360,
    boxSizing: 'border-box',
    position: 'absolute',
    background: 'linear-gradient(90deg, #b1e9fe 0%, #d5e9fc 10%, #ffffff 100%)',
    boxShadow: '-2px 0 8px rgba(0,0,0,0.08)',
    borderLeft: '1px dashed #fff',
    // 모바일에서 가로 드래그만 방지 (세로 스크롤은 허용)
    touchAction: 'pan-y',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    MozUserSelect: 'none',
    msUserSelect: 'none',
  },
}));

export const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
  // background: '#edf2fa',
  // background: 'linear-gradient(135deg, #4299e1 0%, #3182ce 50%, #2c5282  100%)',
  background: 'linear-gradient(135deg, #2c5282 0%, #3182ce 50%,  #4299e1 100%)',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
}));

export const CustomTable = styled(Table)(() => ({
  '& th': {
    borderTop: '2px solid #33489c',
    paddingTop: '12px',
    paddingBottom: '12px',
    textAlign: 'center',
    // backgroundColor: '#4c85e9',
    // color: 'white',
    background: '#b9daf5',
    color: '#33489c',
    fontSize: '14px',
  },
  '& td': {
    borderBottom: '1px solid #ddd',
    padding: '8px',
    textAlign: 'center',
    fontSize: '14px',
  },
  '& tr:hover': {
    backgroundColor: '#c2e9fa',
  },
  '.nopadwidth': {
    padding: '8px 0px',
    textAlign: 'left',
  },
}));

export const CustomChip = styled(Chip)(() => ({
  backgroundColor: '#f0f7ff',
  color: '#1976d2',
  border: '1px solid #90caf9',
  '&:hover': {
    backgroundColor: '#e3f2fd',
    transform: 'translateY(-1px)',
    boxShadow: '0 2px 4px rgba(25, 118, 210, 0.1)',
  },
  '&:active': {
    transform: 'translateY(0)',
    boxShadow: 'none',
  },
  transition: 'all 0.2s ease',
  fontWeight: 500,
  fontSize: '0.875rem',
  height: '32px',
  '& .MuiChip-label': {
    px: 2,
  },
}));
