// @flow

import { CkEditorProps } from '@/app/(admin)/settings/ebrd/comp/CkEditorBody';
import { BoxProps } from '@mui/material';
import dynamic from 'next/dynamic';
import * as React from 'react';

const CkEditorBody = dynamic(
  () => import('@/app/(admin)/settings/ebrd/comp/CkEditorBody').then((mod) => mod.CkEditorBody),
  { ssr: false, loading: () => <div>Loading editor...</div> }
);

export const CkEditor = (props: CkEditorProps & BoxProps) => {
  return <CkEditorBody {...props} />;
};
