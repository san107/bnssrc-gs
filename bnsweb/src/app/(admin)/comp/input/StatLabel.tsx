// @flow
import { styled } from '@mui/material/styles';
import * as React from 'react';
type Props = {
  stat?: string;
  label?: string | null;
};
export const StatLabel = ({ stat, label }: Props) => {
  return <Body className={stat}>{label}</Body>;
};

const Body = styled('span')`
  display: inline-block;
  padding: 0px 10px;
  font-weight: 500;
  border-radius: 4px;
  background-color: #f0f0f0;
  &.Err,
  &.Fail,
  &.Crit,
  &.ModeErr,
  &.DownLock,
  &.DownOk {
    /* background-color: #ff0000;
    color: #fff; */
    background-color: #ffe5e5;
    color: #d32f2f;
    border: 1px solid rgba(211, 47, 47, 0.2);
  }
  &.Ok,
  &.Success,
  &.UpOk,
  &.UpLock,
  &.Norm {
    /* background-color: #00ff00;
    color: #000; */
    background-color: #e8f5e9;
    color: #2e7d32;
    border: 1px solid rgba(46, 125, 50, 0.2);
  }
  &.Moving,
  &.UpAction,
  &.DownAction,
  &.Warn,
  &.Alert {
    /* background-color: #ffa500;
    color: #fff; */
    background-color: #fff3e0;
    color: #ef6c00;
    border: 1px solid rgba(239, 108, 0, 0.2);
  }
  &.Attn {
    /* background-color: #0000ff;
    color: #fff; */
    background-color: #e3f2fd;
    color: #1565c0;
    border: 1px solid rgba(21, 101, 192, 0.2);
  }
  &.Na {
    background-color: #f0f0f0;
    color: #333;
    border: 1px solid rgba(0, 0, 0, 0.2);
  }
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
  }
`;
