'use client';
import { useAlertStore, useDlgAlert } from '@/app/(admin)/comp/popup/DlgAlert';
import { useConfirmStore, useDlgConfrim } from '@/app/(admin)/comp/popup/DlgConfirm';
import { useLoginInfo } from '@/app/(admin)/leftmenu/useLoginInfo';
import styled from '@emotion/styled';
import axios from 'axios';
import Link from 'next/link';
import { useEffect } from 'react';

export const Nav = () => {
  const [refAlert, DlgAlert] = useDlgAlert();
  const { setRef } = useAlertStore();

  const [refConfirm, DlgConfirm] = useDlgConfrim();
  const { setRef: setConfirmRef } = useConfirmStore();
  useEffect(() => {
    (window as any).axios = axios;
    setRef(refAlert);
    setConfirmRef(refConfirm);
  }, [refAlert, setRef, refConfirm, setConfirmRef]);

  const { getlogin } = useLoginInfo();
  useEffect(() => {
    getlogin();
  }, [getlogin]);

  return (
    <Body>
      <Link href='/'>홈</Link>
      <Link href='/tests'>테스트홈</Link>
      <Link href='/tests/map'>Map</Link>
      <Link href='/tests/vwmap'>Vworks Map</Link>
      <Link href='/tests/form'>Form</Link>
      <Link href='/tests/camera'>카메라/차단장비</Link>
      <Link href='/tests/weather'>날씨(영월군)</Link>
      <Link href='/tests/emcall'>비상통화장치</Link>
      <Link href='/tests/ckeditor'>CK에디터</Link>
      <DlgAlert />
      <DlgConfirm />
    </Body>
  );
};

const Body = styled.div`
  & a {
    margin: 0px 10px;
  }
  border-bottom: 1px solid #ccc;
`;
