// @flow
/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import { Box, BoxProps, Card, CardProps, IconButton, styled } from '@mui/material';
import { HTMLProps } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';

export const FormTr = (props: BoxProps & HTMLProps<HTMLTableRowElement>) => {
  return <Box component={'tr'} {...props} />;
};
export const FormTd = (props: BoxProps & HTMLProps<HTMLTableCellElement>) => {
  return <Box component={'td'} {...props} />;
};
export const FormTh = (props: BoxProps & HTMLProps<HTMLTableCellElement>) => {
  return <Box component={'th'} {...props} />;
};

export const FormBtn = styled('button')({
  width: '100%',
  minHeight: '40px',
  textAlign: 'left',
  cursor: 'pointer',
});

export const FormDelBtn = ({ onClick }: { onClick: () => void }) => {
  return (
    <IconButton
      aria-label='delete'
      size='small'
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
    >
      <DeleteIcon fontSize='inherit' />
    </IconButton>
  );
};

// export const FormTr = styled(
//   (props: React.HTMLAttributes<HTMLDivElement>) => (
//     <div {...props} className={`${props.className} tr`} />
//   ),
//   { shouldForwardProp: isPropValid }
// )``;

// export const FormTh = styled(
//   (props: React.HTMLAttributes<HTMLDivElement>) => (
//     <div {...props} className={`${props.className} th`} />
//   ),
//   { shouldForwardProp: isPropValid }
// )``;

// export const FormTd = styled(
//   (props: React.HTMLAttributes<HTMLDivElement>) => (
//     <div {...props} className={`${props.className} td`} />
//   ),
//   { shouldForwardProp: isPropValid }
// )``;

export const FormTbl = (props: BoxProps) => {
  return (
    <Box
      component={'table'}
      {...props}
      css={css`
        border-collapse: collapse;
        //border-radius: 10px;
        & tr {
          table-layout: fixed;

          & th {
            //border-top: 1px solid #ccc;
            border-bottom: 1px solid #ccc;
            //background-color: #edf0f6;
            background-color: #f5f5f5;
          }
          & td {
            //border-top: 1px solid #ccc;
            border-bottom: 1px solid #ccc;
            padding: 2px;
          }
        }
      `}
    />
  );
};

export const FormCard = (props: CardProps & HTMLProps<HTMLElement>) => {
  return (
    <Card
      sx={{
        height: '100%',
        padding: 2,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
      }}
      {...props}
    />
  );
};
