"use client";

import { useEffect, ReactNode } from 'react';
import useAuthStore from '@/lib/store/authStore';
import { AuthGuard } from '@/components/auth/AuthGuard';

interface ClientAuthWrapperProps {
  children: ReactNode;
}

export function ClientAuthWrapper({ children }: ClientAuthWrapperProps) {
  useEffect(() => {
    // Check session on initial load
    useAuthStore.getState().checkSession();
  }, []);

  return <AuthGuard>{children}</AuthGuard>;
}