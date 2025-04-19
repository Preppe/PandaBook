'use client';

import React, { useEffect, useRef } from 'react';
import useAudioStore from '../lib/store/audioStore';

const AudioPlayer: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const {
    isPlaying,
    volume,
    currentTime,
    duration,
    src,
    setAudioElement,
    play,
    pause,
    togglePlayPause,
    setVolume,
    setCurrentTime,
    updateCurrentTime,
    updateDuration,
  } = useAudioStore();

  // Set the audio element in the store once the component mounts
  useEffect(() => {
    if (audioRef.current) {
      setAudioElement(audioRef.current);
    }
  }, [setAudioElement]);

  // Sync store state with audio element properties
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      // Note: currentTime is updated via event listener, not directly set here
      // src is set via setSrc action
    }
  }, [volume]);

  // Add event listeners to the audio element
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      updateCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      updateDuration(audio.duration);
    };

    const handleEnded = () => {
      useAudioStore.getState().pause(); // Use getState to avoid dependency on pause
      updateCurrentTime(0); // Reset time on end
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [updateCurrentTime, updateDuration]); // Dependencies for effect

  // Sync play/pause state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch(error => console.error("Error playing audio:", error));
    } else {
      audio.pause();
    }
  }, [isPlaying]); // Dependency on isPlaying

  // Placeholder URL for testing
  const placeholderAudioUrl = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

  // Set placeholder source on initial load if no src is set
  useEffect(() => {
    if (!src) {
      useAudioStore.getState().setSrc(placeholderAudioUrl);
    }
  }, [src]); // Dependency on src

  return (
    <div>
      <audio ref={audioRef} src={src || undefined} preload="auto" />

    </div>
  );
};

export default AudioPlayer;