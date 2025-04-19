import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Book } from '@/lib/models/Book'; // Import the Book type

// TrackInfo can be simplified or removed if currentTrack directly holds the Book object
// For now, let's keep it but it won't be directly used for currentTrack state type
export interface TrackInfo {
  id: string;
  title: string;
  artist: string; // Corresponds to Book.author
  coverImageUrl?: string; // Corresponds to Book.cover
  // audioUrl is removed, will be generated dynamically
}


interface AudioState {
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  src: string | null;
  audioElement: HTMLAudioElement | null;
  currentTrack: Book | null; // Changed to hold the full Book object
  isFullPlayerVisible: boolean; // Added state for full player visibility
  isMiniPlayerActive: boolean; // Added state for mini-player activity
}

interface AudioActions {
  setAudioElement: (element: HTMLAudioElement) => void;
  play: () => void;
  pause: () => void;
  togglePlayPause: () => void;
  setVolume: (volume: number) => void;
  setCurrentTime: (time: number) => void;
  setSrc: (src: string | null) => void;
  updateCurrentTime: (time: number) => void;
  updateDuration: (duration: number) => void;
  setCurrentTrack: (book: Book | null) => void; // Changed to accept Book object
  setIsFullPlayerVisible: (visible: boolean) => void; // Added action to control full player visibility
  setIsMiniPlayerActive: (active: boolean) => void; // Added action to control mini-player activity
}

const useAudioStore = create<AudioState & AudioActions>()(
  persist(
    (set, get) => ({
  isPlaying: false,
  volume: 1, // Default volume
  currentTime: 0,
  duration: 0,
  src: null,
  audioElement: null,
  currentTrack: null,
  isFullPlayerVisible: false, // Initial state: full player is hidden
  isMiniPlayerActive: false, // Initial state: mini-player is inactive

  setAudioElement: (element) => set({ audioElement: element }),

  play: () => {
    const { audioElement } = get();
    if (audioElement && audioElement.paused) {
      audioElement.play().catch(error => console.error("Error playing audio:", error));
      set({ isPlaying: true });
    }
  },

  pause: () => {
    const { audioElement } = get();
    if (audioElement && !audioElement.paused) {
      audioElement.pause();
      set({ isPlaying: false });
    }
  },

  togglePlayPause: () => {
    const { isPlaying } = get();
    if (isPlaying) {
      get().pause();
    } else {
      get().play();
    }
  },

  setVolume: (volume) => {
    const { audioElement } = get();
    if (audioElement) {
      audioElement.volume = volume;
      set({ volume });
    }
  },

  setCurrentTime: (time) => {
    const { audioElement } = get();
    if (audioElement) {
      audioElement.currentTime = time;
      set({ currentTime: time });
    }
  },

  setSrc: (src) => {
    const { audioElement } = get();
    if (audioElement) {
      audioElement.src = src || '';
      set({ src, currentTime: 0, duration: 0, isPlaying: false });
      if (src) {
        audioElement.load(); // Load the new source
      }
    } else {
       set({ src, currentTime: 0, duration: 0, isPlaying: false });
    }
  },

  updateCurrentTime: (time) => set({ currentTime: time }),
  updateDuration: (duration) => set({ duration: duration }),

  setCurrentTrack: (book) => {
    set({ currentTrack: book, isMiniPlayerActive: book !== null }); // Activate mini-player when a book is set
    if (book) {
      // Construct the stream URL dynamically
      const streamUrl = `http://localhost:3000/api/v1/books/${book.id}/stream`;
      get().setSrc(streamUrl);
    } else {
      get().setSrc(null);
      // Optionally pause when track is cleared
      // get().pause();
    }
  },

  setIsFullPlayerVisible: (visible) => set({ isFullPlayerVisible: visible }),
  setIsMiniPlayerActive: (active) => set({ isMiniPlayerActive: active }),
    }),
    {
      name: 'audio-storage', // Unique name for localStorage key
      storage: createJSONStorage(() => localStorage), // Use localStorage
      partialize: (state) => ({ currentTrack: state.currentTrack }), // Only persist currentTrack
      // Optional: Add logic here to re-set the src when the store is rehydrated
      // onRehydrateStorage: () => (state) => {
      //   if (state?.currentTrack) {
      //     state.setSrc(state.currentTrack.audioUrl);
      //     // Potentially set isMiniPlayerActive based on persisted track
      //     state.setIsMiniPlayerActive(true);
      //   }
      // }
    }
  )
);

export default useAudioStore;