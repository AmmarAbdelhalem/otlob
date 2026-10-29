'use client';

import React from 'react';
import { HeroUIProvider } from '@heroui/react';
import { useRouter } from 'next/navigation';

export function HeroProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return <HeroUIProvider navigate={router.push}>{children}</HeroUIProvider>;
}
