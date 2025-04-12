"use client";
import { ReactNode, useRef } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { ClientAuthWrapper } from "@/components/auth/ClientAuthWrapper";

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  // Create a QueryClient instance only once
  const queryClientRef = useRef<null | QueryClient>(null);
  if (!queryClientRef.current) {
    queryClientRef.current = new QueryClient();
  }

  return (
    <QueryClientProvider client={queryClientRef.current}>
      <ClientAuthWrapper>
        {children}
      </ClientAuthWrapper>
    </QueryClientProvider>
  );
}