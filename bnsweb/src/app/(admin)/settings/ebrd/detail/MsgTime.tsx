// @flow
import { useInterval } from '@/hooks/useInterval';
import { Box, styled } from '@mui/material';
import * as React from 'react';
import { useState } from 'react';
type Props = {
  width?: number;
  height?: number;
};
export const MsgTime = ({}: Props) => {
  const [time, setTime] = useState(new Date());
  useInterval(1000, true, () => {
    setTime(new Date());
  });
  return (
    <Body>
      시간표시(예시)
      <br />
      {time.toLocaleTimeString()}
    </Body>
  );
};

const Body = styled(Box)`
  background-color: black;
  color: yellow;
  width: 100%;
  font-size: 32px;
  font-weight: 700;
  text-align: center;
  padding: 50px;
`;
