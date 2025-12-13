// @flow
import { BoardEditorProps } from '@/app/(admin)/settings/admin/comp/BoardEditorBody';
import { BoxProps } from '@mui/material';
import dynamic from 'next/dynamic';
import * as React from 'react';

const BoardEditorBody = dynamic(
  () =>
    import('@/app/(admin)/settings/admin/comp/BoardEditorBody').then((mod) => mod.BoardEditorBody),
  { ssr: false, loading: () => <div>Loading editor...</div> }
);

export const BoardEditor = (props: BoardEditorProps & BoxProps) => {
  return <BoardEditorBody {...props} />;
};
