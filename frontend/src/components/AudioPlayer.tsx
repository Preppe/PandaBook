'use client';

import React, { useEffect, useRef, useCallback } from 'react'; // Removed useState
import useAudioStore from '../lib/store/audioStore';
import { useWebSocket } from '@/lib/hooks/useWebSocket'; // Import WebSocket hook
import useAuthStore from '@/lib/store/authStore'; // Import Auth store
import { useFetchProgress } from '@/lib/api/progressClient'; // Import progress fetch hook
import throttle from 'lodash.throttle'; // Import throttle


const AudioPlayer: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  // Refs for managing initial seek logic
  const isMetadataLoadedRef = useRef(false);
  const hasFetchedProgressRef = useRef(false);
  const hasPerformedSeekRef = useRef(false);
  const fetchedProgressTimeRef = useRef<number | null>(null);

  const {
    isPlaying,
    volume,
    currentTime,
    duration,
    src,
    currentTrack, // Need currentTrack for bookId
    setAudioElement,
    pause,
    togglePlayPause,
    setVolume,
    setCurrentTime,
    updateCurrentTime,
    updateDuration,
  } = useAudioStore();
  const { user } = useAuthStore(); // Get user from auth store
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
  const { emitEvent, isConnected } = useWebSocket(wsUrl); // Get emit function

  // --- Throttled progress update ---
  const sendProgressUpdate = useCallback(
    throttle((currentTime: number) => {
      if (isConnected && user && currentTrack && isPlaying) {
        // console.log(`Sending progress: User ${user.id}, Book ${currentTrack.id}, Time ${currentTime}`); // Removed log
        emitEvent('updateProgress', {
          userId: user.id,
          bookId: currentTrack.id,
          time: Math.floor(currentTime), // Send time as integer seconds
        });
      }
    }, 5000, { leading: false, trailing: true }), // Throttle to every 5s, ensure last update sent
    [isConnected, user, currentTrack, isPlaying, emitEvent] // Dependencies for the throttled callback
  );
  // --- End Throttled progress update ---

  // --- Fetch initial progress ---
  const bookId = currentTrack?.id;
  const userId = user?.id;
  // Corrected: Pass userId, bookId, and options
  const { data: progressQuery, isLoading: isLoadingProgress } = useFetchProgress(
    userId, // First argument: userId (string | undefined)
    bookId, // Second argument: bookId (string | undefined)
    undefined // Third argument: options (explicitly undefined)
  );
  // --- End Fetch initial progress ---

  // --- Function to attempt initial seek ---
  const attemptInitialSeek = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // console.log('Attempting initial seek. Conditions:', { // Removed log
    //   metadataLoaded: isMetadataLoadedRef.current,
    //   progressFetched: hasFetchedProgressRef.current,
    //   seekPerformed: hasPerformedSeekRef.current,
    //   fetchedTime: fetchedProgressTimeRef.current,
    // });

    if (
      isMetadataLoadedRef.current &&
      hasFetchedProgressRef.current &&
      !hasPerformedSeekRef.current
    ) {
      const seekTime = fetchedProgressTimeRef.current;
      if (seekTime !== null && typeof seekTime === 'number' && seekTime > 0) {
        // Check if the seek time is within the loaded duration
        if (seekTime < audio.duration) {
          // console.log(`Performing initial seek to: ${seekTime}`); // Removed log
          audio.currentTime = seekTime;
        } else {
          // console.warn(`Seek time ${seekTime} is beyond duration ${audio.duration}. Seeking to start.`); // Removed log
          audio.currentTime = 0;
        }
      } else {
        // console.log('No valid fetched progress time to seek to.'); // Removed log
      }
      // Mark seek as performed for this track load, regardless of whether we actually seeked
      hasPerformedSeekRef.current = true;
      // console.log('Seek attempt finished, hasPerformedSeekRef set to true.'); // Removed log
    } else {
       // console.log('Initial seek conditions not met.'); // Removed log
    }
  }, [audioRef]); // Dependency on audioRef (stable)
  // --- End Function to attempt initial seek ---


  // --- Effect for Progress Fetch ---
  useEffect(() => {
    // console.log(`Progress effect running for bookId: ${bookId}. Query loading: ${isLoadingProgress}, Query data:`, progressQuery); // Removed log

    // If bookId is not set yet, don't do anything.
    if (!bookId) {
        // console.log("Progress effect: No bookId, skipping."); // Removed log
        return;
    }

    // Check if the query has finished loading and we have data *or* know there's none
    if (!isLoadingProgress) {
        // The query key includes bookId, so TanStack Query ensures 'progressQuery' corresponds
        // to the 'bookId' this effect ran for, once 'isLoadingProgress' is false.
        // The separate effect resetting refs on bookId change prevents using old refs.

        // Now process the potentially valid progressQuery (or lack thereof for the current bookId)
        if (progressQuery?.time !== undefined && typeof progressQuery.time === 'number') {
            // Valid progress found for the current book
            // console.log(`Fetched progress time for book ${bookId}: ${progressQuery.time}`); // Removed log
            fetchedProgressTimeRef.current = progressQuery.time;
            hasFetchedProgressRef.current = true;
            // console.log('Progress fetched, calling attemptInitialSeek.'); // Removed log
            attemptInitialSeek();
        } else {
            // No progress data found (progressQuery is null/undefined, or time is invalid/missing for the current book)
            // console.log(`No valid progress data found for book ${bookId}. Marking fetch attempt as complete.`); // Removed log
            fetchedProgressTimeRef.current = null;
            hasFetchedProgressRef.current = true; // Mark fetch attempt as complete
            // console.log('Progress fetch marked complete (no data), calling attemptInitialSeek.'); // Removed log
            attemptInitialSeek(); // Attempt seek even if no progress, might just start from 0
        }
    } else {
        // console.log("Progress effect: Query is still loading."); // Removed log
    }

  }, [progressQuery, bookId, isLoadingProgress, attemptInitialSeek]); // Added isLoadingProgress dependency
  // --- End Effect for Progress Fetch ---


  // --- Effect for Track Change (Resetting Refs) ---
  useEffect(() => {
    // console.log(`Track changed to ${currentTrack?.id}. Resetting seek state.`); // Removed log
    // Reset all refs when the track changes
    isMetadataLoadedRef.current = false;
    hasFetchedProgressRef.current = false;
    hasPerformedSeekRef.current = false;
    fetchedProgressTimeRef.current = null;
  }, [currentTrack?.id]); // Depend only on the track ID
  // --- End Effect for Track Change ---


  // --- Immediate progress update on pause ---
  const sendFinalProgressUpdate = useCallback(() => {
    const audio = audioRef.current;
    if (isConnected && user && currentTrack && audio && !audio.ended) {
      const finalTime = Math.floor(audio.currentTime);
      // console.log(`Sending FINAL progress on pause: User ${user.id}, Book ${currentTrack.id}, Time ${finalTime}`); // Removed log
      emitEvent('updateProgress', {
        userId: user.id,
        bookId: currentTrack.id,
        time: finalTime,
      });
      // Cancel any pending throttled updates to avoid sending old data after the final one
      sendProgressUpdate.cancel();
    }
  }, [isConnected, user, currentTrack, emitEvent, sendProgressUpdate]); // Added sendProgressUpdate to dependencies
  // --- End Immediate progress update ---


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
      const currentTime = audio.currentTime;
      updateCurrentTime(currentTime);
      // Call the throttled function
      sendProgressUpdate(currentTime);
    };

    const handleLoadedMetadata = () => {
      // console.log('Metadata loaded. Duration:', audio.duration); // Removed log
      updateDuration(audio.duration);
      isMetadataLoadedRef.current = true;
      // console.log('Metadata loaded, calling attemptInitialSeek.'); // Removed log
      attemptInitialSeek(); // Call attemptInitialSeek when metadata is loaded
    };

    const handleEnded = () => {
      useAudioStore.getState().pause(); // Use getState to avoid dependency on pause
      updateCurrentTime(0); // Reset time on end
    };

    // --- Add Pause Event Listener ---
    const handlePause = () => {
      // Call the immediate update function when paused intentionally
      sendFinalProgressUpdate();
    };
    // --- End Pause Event Listener ---


    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('pause', handlePause); // Add the pause listener

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('pause', handlePause); // Remove the pause listener
    };
    // Add sendProgressUpdate, sendFinalProgressUpdate, and attemptInitialSeek to dependencies
  }, [updateCurrentTime, updateDuration, sendProgressUpdate, sendFinalProgressUpdate, attemptInitialSeek]); // Added attemptInitialSeek

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

  // Placeholder logic removed - src should be set via setCurrentTrack

  return (
    <div>
      {/* Ensure src is correctly passed from the store */}
      <audio ref={audioRef} src={src || undefined} preload="metadata" /> {/* Changed preload to metadata */}

    </div>
  );
};

export default AudioPlayer;