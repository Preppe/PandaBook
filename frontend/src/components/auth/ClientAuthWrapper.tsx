"use client";

import { useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation'; // Import usePathname
import useAuthStore from '@/lib/store/authStore';
import { AuthGuard } from '@/components/auth/AuthGuard';
import Header from '@/components/ui/layout/Header'; // Import Header
import BottomNav from '@/components/ui/layout/BottomNav'; // Import BottomNav
import { cn } from '@/lib/utils'; // Import cn utility

interface ClientAuthWrapperProps {
  children: ReactNode;
}

export function ClientAuthWrapper({ children }: ClientAuthWrapperProps) {
  const pathname = usePathname(); // Get current path

  useEffect(() => {
    // Check session on initial load
    useAuthStore.getState().checkSession();
  }, []);

  // Define paths where Header and BottomNav should be hidden
  const hideLayoutPaths = ['/login'];
  const hideLayoutPatterns = [/^\/player\/.+/]; // Regex for /player/:id

  // Determine if the layout should be shown
  const showLayout = !hideLayoutPaths.includes(pathname) &&
                     !hideLayoutPatterns.some(pattern => pattern.test(pathname));

  return (
    <>
      {showLayout && <Header />} {/* Conditionally render Header */}
      <main className={cn(
        // Add padding only when Header and BottomNav are shown to prevent content overlap
        // Adjust these values based on your Header/BottomNav heights
        showLayout ? 'pt-16 pb-16' : ''
      )}>
        <AuthGuard>{children}</AuthGuard> {/* AuthGuard now wraps only the children */}
      </main>
      {showLayout && <BottomNav />} {/* Conditionally render BottomNav */}
    </>
  );
}