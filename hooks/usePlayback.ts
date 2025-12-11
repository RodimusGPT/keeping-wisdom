import { useState, useRef, useCallback, useEffect } from 'react';
import { Audio } from 'expo-av';

type PlaybackSpeed = 'normal' | 'slow';

export function usePlayback() {
  const sound = useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState<PlaybackSpeed>('normal');
  const [isLoaded, setIsLoaded] = useState(false);

  const loadAudio = useCallback(async (uri: string) => {
    try {
      // Unload any existing sound
      if (sound.current) {
        await sound.current.unloadAsync();
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      const { sound: newSound, status } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: false },
        (playbackStatus) => {
          if (playbackStatus.isLoaded) {
            setPosition(playbackStatus.positionMillis);
            setDuration(playbackStatus.durationMillis || 0);
            setIsPlaying(playbackStatus.isPlaying);

            if (playbackStatus.didJustFinish) {
              setIsPlaying(false);
              setPosition(0);
            }
          }
        }
      );

      sound.current = newSound;
      setIsLoaded(true);

      if (status.isLoaded) {
        setDuration(status.durationMillis || 0);
      }

      return true;
    } catch (error) {
      console.error('Error loading audio:', error);
      setIsLoaded(false);
      return false;
    }
  }, []);

  const play = useCallback(async () => {
    try {
      if (sound.current) {
        await sound.current.playAsync();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  }, []);

  const pause = useCallback(async () => {
    try {
      if (sound.current) {
        await sound.current.pauseAsync();
        setIsPlaying(false);
      }
    } catch (error) {
      console.error('Error pausing audio:', error);
    }
  }, []);

  const togglePlayPause = useCallback(async () => {
    if (isPlaying) {
      await pause();
    } else {
      await play();
    }
  }, [isPlaying, play, pause]);

  const seekTo = useCallback(async (positionMs: number) => {
    try {
      if (sound.current) {
        await sound.current.setPositionAsync(positionMs);
        setPosition(positionMs);
      }
    } catch (error) {
      console.error('Error seeking:', error);
    }
  }, []);

  const changeSpeed = useCallback(async (newSpeed: PlaybackSpeed) => {
    try {
      if (sound.current) {
        const rate = newSpeed === 'slow' ? 0.75 : 1.0;
        await sound.current.setRateAsync(rate, true);
        setSpeed(newSpeed);
      }
    } catch (error) {
      console.error('Error changing speed:', error);
    }
  }, []);

  const toggleSpeed = useCallback(async () => {
    const newSpeed = speed === 'normal' ? 'slow' : 'normal';
    await changeSpeed(newSpeed);
  }, [speed, changeSpeed]);

  const unload = useCallback(async () => {
    try {
      if (sound.current) {
        await sound.current.unloadAsync();
        sound.current = null;
      }
      setIsLoaded(false);
      setIsPlaying(false);
      setPosition(0);
      setDuration(0);
    } catch (error) {
      console.error('Error unloading audio:', error);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sound.current) {
        sound.current.unloadAsync();
      }
    };
  }, []);

  return {
    isPlaying,
    isLoaded,
    position,
    duration,
    speed,
    loadAudio,
    play,
    pause,
    togglePlayPause,
    seekTo,
    changeSpeed,
    toggleSpeed,
    unload,
  };
}
