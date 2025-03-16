'use client';

import CustomSessionProvider from '@/components/CustomSessionProvider';

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CustomSessionProvider>{children}</CustomSessionProvider>;
} 