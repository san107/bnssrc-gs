// @flow
import { useLoading } from '@/store/useLoading';
import { CircularProgress, styled } from '@mui/material';
import * as React from 'react';
import { useEffect } from 'react';
type Props = {};
export const LoadingIcon = ({}: Props) => {
  const { cnt } = useLoading();
  const [debouncedCnt, setDebouncedCnt] = React.useState(cnt);

  useEffect(() => {
    if (cnt > 0) {
      setDebouncedCnt(cnt);
      return;
    }
    let handler = setTimeout(() => {
      setDebouncedCnt(cnt);
      handler = undefined as any;
    }, 1000);

    return () => {
      if (handler) clearTimeout(handler);
    };
  }, [cnt]);

  return <Loading size={23} thickness={8} cnt={debouncedCnt} color={'info'}></Loading>;
};

const Loading = styled(CircularProgress)<{ cnt: number }>`
  transition: opacity 0.3s ease-in-out;
  opacity: ${({ cnt }) => (cnt > 0 ? 1 : 0)};
`;
