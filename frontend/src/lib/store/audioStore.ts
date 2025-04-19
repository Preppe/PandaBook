import { create } from 'zustand';

interface TrackInfo {
  id: string; // Assuming a unique ID for the track
  title: string;
  artist: string;
  coverImageUrl?: string; // Optional cover image URL
  audioUrl: string; // URL for the audio file
}

interface AudioState {
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  src: string | null;
  audioElement: HTMLAudioElement | null;
  currentTrack: TrackInfo | null;
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
  setCurrentTrack: (track: TrackInfo | null) => void;
  setIsFullPlayerVisible: (visible: boolean) => void; // Added action to control full player visibility
  setIsMiniPlayerActive: (active: boolean) => void; // Added action to control mini-player activity
}

const useAudioStore = create<AudioState & AudioActions>((set, get) => ({
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

  setCurrentTrack: (track) => {
    set({ currentTrack: track, isMiniPlayerActive: track !== null }); // Activate mini-player when a track is set
    if (track) {
      get().setSrc(track.audioUrl);
    } else {
      get().setSrc(null);
    }
  },

  setIsFullPlayerVisible: (visible) => set({ isFullPlayerVisible: visible }),
  setIsMiniPlayerActive: (active) => set({ isMiniPlayerActive: active }),
}));

export default useAudioStore;