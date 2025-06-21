import React from "react";
import PlayButton from "@/components/ui/PlayButton";
import { useFetchPaginatedProgress } from "@/lib/api/progressClient"; // Import the progress hook
import { useBook } from "@/lib/api/bookClient"; // Import the book hook
import useAudioStore, { AudioState, AudioActions } from "@/lib/store/audioStore"; // Corrected path and import state types
// Removed unused Book import

// Helper function to calculate progress percentage (optional, depends on data structure)
// This assumes you have total duration available somewhere, maybe linked to the book entity
// For now, we'll just display the time or a placeholder
// const calculateProgressPercentage = (currentTime: number, totalDuration: number): number => {
//   if (totalDuration <= 0) return 0;
//   return (currentTime / totalDuration) * 100;
// };


export default function CurrentlyPlaying() {
  // Fetch the paginated progress, sorted by most recent update
  const { data: paginatedProgress, isLoading: isLoadingProgress, isError: isErrorProgress } = useFetchPaginatedProgress();

  // Get the most recently listened audiobook progress (the first item)
  const latestProgress = paginatedProgress?.data?.[0];

  // Fetch the book details based on the bookId from the latest progress
  const { data: bookDetails, isLoading: isLoadingBook, isError: isErrorBook } = useBook(
    latestProgress?.bookId || '', // Provide fallback instead of non-null assertion
    {
      queryKey: ['book', latestProgress?.bookId], // Add queryKey
      enabled: !!latestProgress?.bookId, // Only fetch if latestProgress and bookId exist
    }
  );

  // Get actions from audio store with explicit state typing
  const setCurrentTrack = useAudioStore((state: AudioState & AudioActions) => state.setCurrentTrack);
  const setCurrentTime = useAudioStore((state: AudioState & AudioActions) => state.setCurrentTime); // Use setCurrentTime

  // If loading progress, book, or error occurred, or no progress/book found, don't render
  if (isLoadingProgress || (latestProgress && isLoadingBook)) {
    // Optional: Render a loading skeleton/spinner
    return null;
  }

  if (isErrorProgress || isErrorBook || !latestProgress || !bookDetails) {
    // Optional: Render an error message or empty state
    return null;
  }

  // Duration is not directly available on Book model, remove percentage calculation for now
  // const progressPercentage = calculateProgressPercentage(latestProgress.time, bookDetails.duration ?? 0);

  // Function to handle clicking the play button
  const handlePlayClick = () => {
    if (!bookDetails) return;
    console.log(`Resuming playback for book: ${bookDetails.title} at time: ${latestProgress.time}`);
    setCurrentTrack(bookDetails); // Set the track in the store
    // Set the current time after a short delay to allow the audio element to load
    setTimeout(() => {
      setCurrentTime(latestProgress.time);
    }, 100); // Adjust delay if needed
  };

  return (
    <div className="mx-6 my-4 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-4 shadow-lg">
      <div className="flex items-center gap-4">
        <img
          src={bookDetails.cover ?? "/placeholder.jpg"} // Use correct 'cover' property
          alt={bookDetails.title}
          className="w-16 h-16 rounded-xl shadow-md object-cover"
        />
        <div className="flex-1">
          <h3 className="text-white font-medium">Continua ad ascoltare</h3>
          <p className="text-white/80 text-sm truncate">{bookDetails.title}</p> {/* Use actual title */}
          <p className="text-white/80 text-xs truncate">{bookDetails.author}</p> {/* Use actual author */}
          {/* Removed dynamic progress bar width as duration is not available */}
          <div className="mt-2 bg-white/20 rounded-full h-1">
            <div className="bg-white rounded-full h-1 w-1/3"></div> {/* Placeholder width */}
          </div>
        </div>
        <PlayButton onClick={handlePlayClick} />
      </div>
    </div>
  );
}
