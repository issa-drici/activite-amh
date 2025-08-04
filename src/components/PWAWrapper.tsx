'use client';

import dynamic from 'next/dynamic';

const PWAInstall = dynamic(() => import('@/components/PWAInstall'), {
  ssr: false,
  loading: () => null
});

const UpdateNotification = dynamic(() => import('@/components/UpdateNotification'), {
  ssr: false,
  loading: () => null
});

export default function PWAWrapper() {
  return (
    <>
      <PWAInstall />
      <UpdateNotification />
    </>
  );
} 