'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// @flow
type Props = {};
const Index = (_props: Props) => {
  const router = useRouter();
  useEffect(() => {
    router.push('/dashbd/dark/');
  }, [router]);

  return <div></div>;
};
export default Index;
