import { create } from 'zustand';

interface AudioState {
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  src: string | null;
  audioElement: HTMLAudioElement | null;
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
}

const useAudioStore = create<AudioState & AudioActions>((set, get) => ({
  isPlaying: false,
  volume: 1, // Default volume
  currentTime: 0,
  duration: 0,
  src: null,
  audioElement: null,

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
}));

export default useAudioStore;