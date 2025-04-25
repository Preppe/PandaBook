'use client';

import React, { useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
// import { useAuth } from '../../context/AuthContext';
import useAuthStore from '@/lib/store/authStore';

interface AuthGuardProps {
  children: ReactNode;
  loadingComponent?: ReactNode;
  loginRoute?: string;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  loadingComponent = <p>Loading authentication status...</p>,
  loginRoute = '/login',
}) => {
  const { isLoading, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated && pathname !== loginRoute) {
      console.log(`AuthGuard: User not authenticated on ${pathname}, redirecting to ${loginRoute}.`);
      router.push(loginRoute);
    }
  }, [isLoading, isAuthenticated, router, loginRoute, pathname]);

  if (pathname === loginRoute) {
    return <>{children}</>;
  }

  if (isLoading) {
    return <>{loadingComponent}</>;
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return <>{loadingComponent}</>;
};