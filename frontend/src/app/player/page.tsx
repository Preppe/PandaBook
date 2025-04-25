"use client";

import React, { useEffect } from "react"; // Import useEffect
import Image from "next/image";
import { useRouter } from "next/navigation"; // Import useRouter
import useAudioStore from "../../lib/store/audioStore";

const PlayerPage = () => {
  const {
    isPlaying,
    currentTime,
    duration,
    togglePlayPause,
    setCurrentTime,
    setIsFullPlayerVisible, // Get action to control full player visibility
    setIsMiniPlayerActive, // Get action to control mini-player activity
    currentTrack, // Get current track info
    skip, // Get the new skip action
  } = useAudioStore();
  const router = useRouter(); // Get router instance

  // Set full player visible when this page is mounted
  // Set full player visible and mini-player inactive when this page is mounted
  useEffect(() => {
    setIsFullPlayerVisible(true);
    setIsMiniPlayerActive(false); // Deactivate mini-player when full player is visible
    return () => {
      // Set full player invisible when this page is unmounted
      setIsFullPlayerVisible(false);
      // Note: Mini-player activation on unmount is handled in handleClosePlayer
    };
  }, [setIsFullPlayerVisible, setIsMiniPlayerActive]); // Add setIsMiniPlayerActive to dependencies

  // Helper function to format time
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  // Handle close button click
  const handleClosePlayer = () => {
    setIsFullPlayerVisible(false); // Hide full player
    setIsMiniPlayerActive(true); // Activate mini-player
    useAudioStore.getState().pause(); // Explicitly pause audio to trigger final progress save
    router.back(); // Navigate back to the previous page
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-orange-100 text-red-800">
      {/* Header */}
      <div id="player-header" className="px-6 pt-12 pb-4">
        <div className="flex justify-between items-center">
          <button className="text-red-800" onClick={handleClosePlayer}>
            <i className="fa-solid fa-chevron-down text-xl"></i>
          </button>
          <span className="font-medium">In riproduzione</span>
          <button className="text-red-800">
            <i className="fa-solid fa-ellipsis-vertical text-xl"></i>
          </button>
        </div>
      </div>

      {/* Book Cover */}
      <div id="book-cover" className="px-6 py-8">
        <div className="relative w-64 h-64 mx-auto">
          {/* Use currentTrack cover image or a default */}
          {/* <Image
            src={currentTrack?.coverImageUrl || "/placeholder.jpg"} // Use actual cover or placeholder
            alt={currentTrack?.title || "Book Cover"} // Use actual title or default alt
            width={256} // specify width
            height={256} // specify height
            className="rounded-3xl shadow-2xl object-cover"
            priority // Prioritize loading the cover image
          /> */}
        </div>
      </div>

      {/* Book Info */}
      <div id="book-info" className="px-6 text-center">
        <h1 className="text-2xl font-bold mb-2">
          {currentTrack?.title || "Loading..."}
        </h1>
        <p className="text-red-600">
          {currentTrack?.author || "Unknown Author"}
        </p>
      </div>

      {/* Progress Bar */}
      <div id="progress-bar" className="px-6 py-8">
        <div className="relative">
          <div className="flex justify-between mt-2 text-sm text-red-600">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          {/* Seek bar */}
          <input
            type="range"
            min="0"
            max={duration || 0}
            step="0.1"
            value={currentTime}
            onChange={(e) => setCurrentTime(parseFloat(e.target.value))}
            className="w-full h-1 bg-red-200 rounded-lg appearance-none cursor-pointer accent-red-500"
          />
        </div>
      </div>

      {/* Player Controls */}
      <div id="player-controls" className="px-6">
        {/* Primary Controls */}
        <div className="flex justify-center items-center gap-8">
          <button
            className="text-red-800 flex flex-col items-center"
            onClick={() => skip(15, "backward")}
          >
            <i className="fa-solid fa-rotate-left text-3xl"></i>{" "}
            <span className="text-xs mt-1">15s</span>
          </button>
          {/* Play/Pause button */}
          <button
            className="bg-red-500 w-20 h-20 rounded-full flex items-center justify-center shadow-lg"
            onClick={togglePlayPause}
          >
            <i
              className={`fa-solid ${
                isPlaying ? "fa-pause" : "fa-play"
              } text-white text-3xl`}
            ></i>
          </button>
          <button
            className="text-red-800 flex flex-col items-center"
            onClick={() => skip(15, "forward")}
          >
            <i className="fa-solid fa-rotate-right text-3xl"></i>{" "}
            <span className="text-xs mt-1">15s</span>
          </button>
        </div>
      </div>

      {/* Speed Control */}
      <div id="speed-control" className="px-6 py-8">
        <div className="flex items-center justify-center gap-4">
          {/* Example: Active state on 1.0x, make dynamic later */}
          <button className="px-4 py-2 rounded-full text-red-600 text-sm">
            0.5x
          </button>
          <button className="px-4 py-2 rounded-full bg-red-500 text-white text-sm">
            1.0x
          </button>
          <button className="px-4 py-2 rounded-full text-red-600 text-sm">
            1.5x
          </button>
          <button className="px-4 py-2 rounded-full text-red-600 text-sm">
            2.0x
          </button>
        </div>
      </div>

      {/* Chapters Button */}
      <div id="chapters-button" className="px-6 pb-12">
        {" "}
        {/* Added padding bottom */}
        <button className="w-full py-3 bg-white/70 border border-red-200 rounded-xl text-red-800 font-medium">
          <i className="fa-solid fa-list-ul mr-2"></i>
          Capitoli
        </button>
      </div>
    </div>
  );
};

export default PlayerPage;
