"use client";
import { ReactNode, useRef } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { ClientAuthWrapper } from "@/components/auth/ClientAuthWrapper";
import MiniPlayer from "@/components/MiniPlayer"; // Import MiniPlayer
import useAudioStore from "@/lib/store/audioStore"; // Import useAudioStore

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  // Create a QueryClient instance only once
  const queryClientRef = useRef<null | QueryClient>(null);
  if (!queryClientRef.current) {
    queryClientRef.current = new QueryClient();
  }

  const { isMiniPlayerActive } = useAudioStore(); // Get mini-player state

  return (
    <QueryClientProvider client={queryClientRef.current}>
      <ClientAuthWrapper>
        {children}
        {/* Render MiniPlayer if active */}
        {isMiniPlayerActive && <MiniPlayer />}
      </ClientAuthWrapper>
    </QueryClientProvider>
  );
}