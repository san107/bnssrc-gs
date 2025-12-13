'use client';

/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import {
  Box,
  BoxProps,
  Card,
  CardProps,
  Paper,
  TableContainer,
  TableContainerProps,
} from '@mui/material';
import { HTMLProps } from 'react';

export const SettPageBody = (props: BoxProps & HTMLProps<HTMLElement>) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        gap: 2,
        height: '100%',
      }}
      {...props}
    />
  );
};

export const SettPageLeft = (props: BoxProps & HTMLProps<HTMLElement>) => {
  return (
    <Box
      sx={{
        flex: { xs: 'none', md: 1 },
        height: { xs: 'auto', md: '100%' },
        width: { xs: '100%', md: '1px' },
      }}
      {...props}
    />
  );
};

export const SettPageRight = (props: BoxProps & HTMLProps<HTMLElement>) => {
  return (
    <Box
      sx={{
        width: { xs: '100%', md: '400px' },
        height: { xs: 'auto', md: '100%' },
      }}
      {...props}
    />
  );
};

export const SettPageCard = (props: CardProps & HTMLProps<HTMLElement>) => {
  return (
    <Card
      sx={{
        padding: 2,
        height: { xs: 'auto', md: '100%' },
        display: 'flex',
        flexDirection: 'column',
      }}
      {...props}
    />
  );
};

export const SettPageTableContainer = (
  props: TableContainerProps & HTMLProps<HTMLTableRowElement>
) => {
  return (
    <TableContainer
      component={Paper}
      sx={{
        height: { xs: 'auto', md: '1px' },
        flexGrow: 1,
      }}
      css={css`
        & .sel {
          background-color: #eef;
        }
        & tr {
          cursor: pointer;
        }
      `}
      className='scroll-table'
      {...props}
    />
  );
};
