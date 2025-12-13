'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function EbrdPage() {
  const router = useRouter();
  useEffect(() => {
    router.push('/settings/admin/web');
  }, [router]);
  return <div></div>;
}
