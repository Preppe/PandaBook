"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import useAudioStore from "../lib/store/audioStore";
import { cn } from "../lib/utils"; // Assuming cn utility exists for class merging

const MiniPlayer = () => {
  const { isPlaying, togglePlayPause, currentTrack, setIsMiniPlayerActive } = useAudioStore(); // Get setIsMiniPlayerActive
  const router = useRouter();

  // The primary control for rendering the mini-player is isMiniPlayerActive in ClientLayout.
  // We keep this component rendered when isMiniPlayerActive is true, even if currentTrack is null,
  // to avoid unexpected behavior if the state is not perfectly synchronized.
  // The content within the mini-player will handle displaying placeholders if currentTrack is null.
  // Removed the explicit return null based on !currentTrack to ensure visibility when isMiniPlayerActive is true.

  const handleOpenPlayer = () => {
    // Only navigate if the full player is not already visible
    // This prevents unnecessary navigation if the user clicks the mini-player
    // while the full player is already open (e.g., via browser back button)
    // We might need to add isFullPlayerVisible to the store and check it here.
    // For now, simple push is sufficient based on the task description.
    router.push("/player"); // Navigate to the full player page
  };

  // Handle close button logic
  const handleCloseMiniPlayer = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering handleOpenPlayer
    setIsMiniPlayerActive(false); // Hide mini-player
    useAudioStore.getState().pause(); // Stop audio when closing the mini-player
  };

  return (
    <div
      className={cn(
        "fixed bottom-16 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-t border-red-200", // Changed bottom-0 to bottom-16
        "flex items-center justify-between px-4 py-2",
        "text-red-800 cursor-pointer" // Added cursor-pointer to indicate it's clickable
      )}
      style={{ zIndex: 1000 }} // Added inline style for higher z-index
      onClick={handleOpenPlayer} // Click the mini-player to open the full player
    >
      {/* Track Info */}
      <div className="flex items-center gap-3">
        <div className="relative w-10 h-10 flex-shrink-0">
          {/* Validate coverImageUrl before using, otherwise use placeholder */}
          <Image
            src={
              currentTrack?.coverImageUrl &&
              (currentTrack.coverImageUrl.startsWith('http') || currentTrack.coverImageUrl.startsWith('/'))
                ? currentTrack.coverImageUrl
                : "/placeholder.jpg" // Default placeholder
            }
            alt={currentTrack?.title || "Book Cover"} // Use actual title or default alt
            fill // Use fill for responsive image in container
            sizes="(max-width: 768px) 10vw, 40px" // Adjusted sizes for small image
            className="rounded-md object-cover"
          />
        </div>
        <div className="flex flex-col overflow-hidden">
          <span className="text-sm font-medium truncate">
            {currentTrack?.title || "Unknown Title"} {/* Use optional chaining */}
          </span>
          <span className="text-xs text-red-600 truncate">
            {currentTrack?.artist || "Unknown Artist"} {/* Use optional chaining */}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <button className="text-red-800" onClick={(e) => { e.stopPropagation(); togglePlayPause(); }}> {/* Added stopPropagation */}
          <i
            className={cn(
              "fa-solid text-xl",
              isPlaying ? "fa-pause" : "fa-play"
            )}
          ></i>
        </button>
        {/* Close Button - Placeholder for now */}
        <button className="text-red-800" onClick={handleCloseMiniPlayer}>
           <i className="fa-solid fa-xmark text-xl"></i> {/* Changed icon to 'x' */}
        </button>
      </div>
    </div>
  );
};

export default MiniPlayer;