'use client'; // Required for hooks like useRouter, useEffect

import React, { useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation'; // Use next/navigation for App Router
// import { useAuth } from '../../context/AuthContext'; // Remove old context import
import useAuthStore from '@/lib/store/authStore'; // Import Zustand store

interface AuthGuardProps {
  children: ReactNode;
  /** Optional: Component to display while checking auth status */
  loadingComponent?: ReactNode;
  /** Optional: Route to redirect unauthenticated users to (default: /login) */
  loginRoute?: string;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  loadingComponent = <p>Loading authentication status...</p>, // Default loading indicator
  loginRoute = '/login',
}) => {
  // Get state directly from the Zustand store
  const { isLoading, isAuthenticated } = useAuthStore();
  // Note: 'user' object is not directly needed for the guard's logic here
  const router = useRouter();
  const pathname = usePathname(); // Get the current path

  useEffect(() => {
    // Only redirect if loading is complete and user is not authenticated
    // Only redirect if loading is complete, user is not authenticated, AND we are not already on the login route
    if (!isLoading && !isAuthenticated && pathname !== loginRoute) {
      console.log(`AuthGuard: User not authenticated on ${pathname}, redirecting to ${loginRoute}.`);
      router.push(loginRoute);
    }
  }, [isLoading, isAuthenticated, router, loginRoute, pathname]); // Add pathname to dependencies

  // --- Rendering Logic ---

  // If we are on the login page, always render the children (the login form)
  // This prevents the guard from blocking the login page itself.
  if (pathname === loginRoute) {
    return <>{children}</>;
  }

  // For any other page:
  // While loading the auth status, show the loading component
  if (isLoading) {
    return <>{loadingComponent}</>;
  }

  // If loading is complete and user is authenticated, render the protected children
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // If loading is complete and user is not authenticated (and not on login page),
  // the redirect effect (useEffect) should be handling the navigation.
  // Show the loading component to prevent flashing content before redirect completes.
  return <>{loadingComponent}</>;
};

// Example Usage (in a layout or page):
//
// import { AuthGuard } from '@/components/auth/AuthGuard';
//
// export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <AuthGuard>
//       {/* Content here is protected */}
//       {children}
//     </AuthGuard>
//   );
// }