import React from "react";
import PlayButton from "./PlayButton";
import { useRouter } from 'next/navigation';
import useAudioStore from "@/lib/store/audioStore"; // Import audio store
// Remove unused imports
// import apiClient from "@/lib/api/apiClient";
// import type { Audio } from "@/lib/models/Audio";
// import type { TrackInfo } from "@/lib/store/audioStore"; // No longer needed
import type { Book } from "@/lib/models/Book"; // Import Book type

interface NewReleaseCardProps {
  book: Book; // Accept the full Book object
  // Rating is removed as it's not part of the Book model
}

export default function NewReleaseCard({
  book, // Destructure the book object
}: NewReleaseCardProps) {
  const router = useRouter();
  const setCurrentTrack = useAudioStore((state) => state.setCurrentTrack); // Get action from store

  const handlePlayClick = () => {
    // 1. Update audio store with the book object
    setCurrentTrack(book);

    // 2. Navigate to player page
    router.push('/player');
  };

  // Use a placeholder if cover is null/undefined
  const coverImage = book.cover || '/placeholder-logo.png'; // Adjust placeholder path if needed

  return (
    <div className="flex gap-4 items-center">
      <img
        src={coverImage} // Use book cover or placeholder
        alt="Book Cover"
        className="w-16 h-20 rounded-xl shadow-md object-cover"
      />
      <div className="flex-1">
        <h3 className="text-red-800 font-medium">{book.title}</h3>
        <p className="text-red-600 text-sm">{book.author}</p>
        {/* Rating display removed as it's not in the Book model */}
        {/* <div className="flex items-center gap-2 mt-1">
          <i className="fa-solid fa-star text-yellow-400 text-xs"></i>
          <span className="text-red-600 text-sm">{rating}</span>
        </div> */}
      </div>
      <PlayButton bgColor="bg-red-500" iconColor="text-white" onClick={handlePlayClick} /> {/* Use handlePlayClick */}
    </div>
  );
}
