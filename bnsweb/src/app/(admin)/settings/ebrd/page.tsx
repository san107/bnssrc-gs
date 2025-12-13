'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function EbrdPage() {
  const router = useRouter();
  useEffect(() => {
    router.push('/settings/ebrd/regist');
  }, [router]);
  return <div></div>;
}
