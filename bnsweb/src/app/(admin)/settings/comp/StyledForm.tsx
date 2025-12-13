import { Box, Card, CardActions, styled } from '@mui/material';
import { FormTbl } from '@/app/(admin)/comp/table/FormTbl';

export const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  overflowY: 'auto',
  backgroundColor: theme.palette.background.paper,
  borderRadius: (theme.shape.borderRadius as number) * 2,
  boxShadow: theme.shadows[2],
}));

export const StyledBox = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  borderRadius: (theme.shape.borderRadius as number) * 2,
  padding: theme.spacing(1),
  marginRight: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  boxShadow: theme.shadows[2],
}));

export const StyledFormTbl = styled(FormTbl)(({ theme }) => ({
  '&.left-border': {
    borderLeft: '3px solid #2c2c2c',
  },
  '&.top-border': {
    borderTop: '3px solid #2c2c2c',
  },
  '&.top-light-border': {
    borderTop: '1px solid #2c2c2c',
  },
  '& .MuiTableCell-root': {
    borderBottom: `1px solid ${theme.palette.divider}`,
    py: 1,
  },
  '& .MuiFormControl-root': {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderWidth: 2,
      },
    },
    '& .MuiInputBase-root': {
      height: '34px',
      minHeight: '34px',
      fontSize: '14px',
    },
  },
  '& th': {
    fontSize: '14px',
  },
}));

export const StyledCardActions = styled(CardActions)(({ theme }) => ({
  justifyContent: 'center',
  borderTop: `1px solid ${theme.palette.divider}`,
  gap: 1,
  '& .MuiButton-root': {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0.5,
    minWidth: '70px',
    minHeight: '60px',
    '& .MuiSvgIcon-root': {
      margin: 0,
      fontSize: '1.5rem',
    },
    '& .MuiButton-startIcon': {
      margin: 0,
    },
  },
}));
