import './globals.css';
import { cn } from '@/lib/utils';
import BottomNav from '@/components/ui/layout/BottomNav';
import Header from '@/components/ui/layout/Header';
// AuthProvider, useAuthStore, AuthGuard imports removed
import { ClientAuthWrapper } from '@/components/auth/ClientAuthWrapper'; // Import the new wrapper

export const metadata = {
  title: "My Next App",
  description: "State-of-the-art Next.js starter"
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // useEffect hook removed

  return (
    <html lang="en">
      <body className={cn('min-h-screen bg-gray-50 font-sans antialiased')}>
        {/* AuthProvider removed */}
        <ClientAuthWrapper> {/* Wrap with the client component */}
          {/* AuthGuard removed */}
          {/*
           * AuthGuard Usage:
           *
           * 1. Protect Entire App (except login/public routes):
           *    Wrap the main content area below with <AuthGuard>. You'll need to ensure
           *    your login page and any other public pages are handled separately, perhaps
           *    by having a different layout for them or conditional rendering within AuthGuard.
           *
           *    <AuthProvider>
           *      <AuthGuard> // Wrap protected content
           *        <Header />
           *        <main>{children}</main>
           *        <BottomNav />
           *      </AuthGuard>
           *    </AuthProvider>
           *
           * 2. Protect Specific Layouts/Routes:
           *    Apply AuthGuard within specific layout files (e.g., app/dashboard/layout.tsx)
           *    or directly on pages that require authentication. This is often more flexible.
           *
           *    // Example: app/dashboard/layout.tsx
           *    import { AuthGuard } from '@/components/auth/AuthGuard';
           *    export default function DashboardLayout({ children }) {
           *      return <AuthGuard>{children}</AuthGuard>;
           *    }
           */}
          <Header /> {/* Header might need access to auth state */}
          <main> {/* Add padding to avoid overlap with fixed Header/BottomNav */}
             {children}
          </main>
          <BottomNav /> {/* BottomNav might need access to auth state */}
          {/* AuthGuard removed */}
        </ClientAuthWrapper> {/* Close the wrapper */}
        {/* AuthProvider removed */}
      </body>
    </html>
  )
}
