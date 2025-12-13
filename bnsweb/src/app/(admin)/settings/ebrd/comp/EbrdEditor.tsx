// @flow
import { EbrdEditorProps } from '@/app/(admin)/settings/ebrd/comp/EbrdEditorBody';
import { BoxProps } from '@mui/material';
import dynamic from 'next/dynamic';
import * as React from 'react';

const EbrdEditorBody = dynamic(
  () => import('@/app/(admin)/settings/ebrd/comp/EbrdEditorBody').then((mod) => mod.EbrdEditorBody),
  { ssr: false, loading: () => <div>Loading editor...</div> }
);

export const EbrdEditor = (props: EbrdEditorProps & BoxProps) => {
  return <EbrdEditorBody {...props} />;
};
