"use client";
import { ReactNode, useRef, useEffect } from "react"; // Import useEffect
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { ClientAuthWrapper } from "@/components/auth/ClientAuthWrapper";
import MiniPlayer from "@/components/MiniPlayer"; // Import MiniPlayer
import useAudioStore from "@/lib/store/audioStore"; // Import useAudioStore
import { useWebSocket } from "@/lib/hooks/useWebSocket"; // Import the hook

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  // Create a QueryClient instance only once
  const queryClientRef = useRef<null | QueryClient>(null);
  if (!queryClientRef.current) {
    queryClientRef.current = new QueryClient();
  }

  // Initialize WebSocket connection
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
  // Note: The hook itself handles connection logic and cleanup.
  // We don't need to use the returned socket/emitEvent directly in this layout component.
  useWebSocket(wsUrl);

  const { isMiniPlayerActive, currentTrack, setSrc, setIsMiniPlayerActive } = useAudioStore(); // Get state and actions

  // Handle rehydration from localStorage
  useEffect(() => {
    // This check ensures we only run this logic once on initial load after hydration
    // We rely on the fact that currentTrack will be populated by the persist middleware
    // if it existed in localStorage.
    if (currentTrack && !useAudioStore.getState().src) { // Check if src is not already set to avoid redundant calls
      console.log("Rehydrating audio state:", currentTrack);
      // Construct the stream URL dynamically, same as in audioStore
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const streamUrl = `${apiUrl}/books/${currentTrack.id}/stream`;
      setSrc(streamUrl);
      setIsMiniPlayerActive(true); // Ensure mini-player is active if track was restored
    }
    // We only want this effect to run once after initial mount/hydration
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrack]); // Depend on currentTrack to run after hydration potentially updates it


  // Calcola padding-bottom dinamico
  const paddingBottom = isMiniPlayerActive ? "pb-40" : "pb-20";

  return (
    <div className={cn('min-h-screen bg-gradient-to-b from-orange-50 to-orange-100 font-sans antialiased', paddingBottom)}>
      <QueryClientProvider client={queryClientRef.current}>
        <ClientAuthWrapper>
          {children}
          {/* Render MiniPlayer if active */}
          {isMiniPlayerActive && <MiniPlayer />}
        </ClientAuthWrapper>
      </QueryClientProvider>
    </div>
  );
}
