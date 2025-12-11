import { useState, useRef, useCallback, useEffect } from 'react';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as Haptics from 'expo-haptics';
import { useAppStore } from '@/store/useAppStore';
import { Recording } from '@/types';

export function useRecording() {
  const recording = useRef<Audio.Recording | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const {
    isRecording,
    recordingDuration,
    setIsRecording,
    setCurrentRecordingId,
    setRecordingDuration,
    addRecording,
    updateRecording,
    settings,
  } = useAppStore();

  const [audioLevel, setAudioLevel] = useState(0);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);

  const requestPermission = useCallback(async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      setPermissionGranted(granted);
      return granted;
    } catch (error) {
      console.error('Error requesting permission:', error);
      setPermissionGranted(false);
      return false;
    }
  }, []);

  const checkPermission = useCallback(async () => {
    try {
      const { granted } = await Audio.getPermissionsAsync();
      setPermissionGranted(granted);
      return granted;
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      // Check/request permission
      let hasPermission = await checkPermission();
      if (!hasPermission) {
        hasPermission = await requestPermission();
        if (!hasPermission) {
          return { success: false, error: 'permission_denied' };
        }
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Create recording with high quality settings
      const { recording: newRecording } = await Audio.Recording.createAsync(
        {
          android: {
            extension: '.m4a',
            outputFormat: Audio.AndroidOutputFormat.MPEG_4,
            audioEncoder: Audio.AndroidAudioEncoder.AAC,
            sampleRate: 44100,
            numberOfChannels: 2,
            bitRate: 128000,
          },
          ios: {
            extension: '.m4a',
            audioQuality: Audio.IOSAudioQuality.HIGH,
            sampleRate: 44100,
            numberOfChannels: 2,
            bitRate: 128000,
            linearPCMBitDepth: 16,
            linearPCMIsBigEndian: false,
            linearPCMIsFloat: false,
          },
          web: {
            mimeType: 'audio/webm',
            bitsPerSecond: 128000,
          },
        },
        (status) => {
          if (status.isRecording && status.metering !== undefined) {
            // Convert metering to 0-1 range (metering is typically -160 to 0)
            const normalized = Math.max(0, Math.min(1, (status.metering + 60) / 60));
            setAudioLevel(normalized);
          }
        },
        100 // Update every 100ms
      );

      recording.current = newRecording;

      // Generate recording ID
      const recordingId = `rec_${Date.now()}`;
      setCurrentRecordingId(recordingId);
      setIsRecording(true);
      setRecordingDuration(0);

      // Start duration timer
      const startTime = Date.now();
      intervalRef.current = setInterval(() => {
        setRecordingDuration(Date.now() - startTime);
      }, 100);

      // Haptic feedback
      if (settings.hapticFeedback) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      return { success: true, recordingId };
    } catch (error) {
      console.error('Error starting recording:', error);
      return { success: false, error: 'start_failed' };
    }
  }, [checkPermission, requestPermission, setCurrentRecordingId, setIsRecording, setRecordingDuration, settings.hapticFeedback]);

  const stopRecording = useCallback(async () => {
    try {
      if (!recording.current) {
        return { success: false, error: 'no_recording' };
      }

      // Stop timer
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      // Stop recording
      await recording.current.stopAndUnloadAsync();

      // Reset audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      const uri = recording.current.getURI();
      const status = await recording.current.getStatusAsync();

      recording.current = null;

      if (!uri) {
        return { success: false, error: 'no_uri' };
      }

      // Get the current recording ID before clearing
      const currentId = useAppStore.getState().currentRecordingId;

      // Create the recording object
      const newRecording: Recording = {
        id: currentId || `rec_${Date.now()}`,
        createdAt: new Date().toISOString(),
        duration: status.durationMillis || recordingDuration,
        audioUri: uri,
        status: 'processing',
        language: settings.language,
      };

      // Add to store
      addRecording(newRecording);

      // Clear recording state
      setIsRecording(false);
      setCurrentRecordingId(null);
      setRecordingDuration(0);
      setAudioLevel(0);

      // Haptic feedback
      if (settings.hapticFeedback) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      return { success: true, recording: newRecording };
    } catch (error) {
      console.error('Error stopping recording:', error);

      // Try to save what we have
      setIsRecording(false);
      setCurrentRecordingId(null);

      return { success: false, error: 'stop_failed' };
    }
  }, [recordingDuration, addRecording, setIsRecording, setCurrentRecordingId, setRecordingDuration, settings.hapticFeedback, settings.language]);

  const cancelRecording = useCallback(async () => {
    try {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      if (recording.current) {
        await recording.current.stopAndUnloadAsync();
        const uri = recording.current.getURI();
        if (uri) {
          await FileSystem.deleteAsync(uri, { idempotent: true });
        }
        recording.current = null;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      setIsRecording(false);
      setCurrentRecordingId(null);
      setRecordingDuration(0);
      setAudioLevel(0);
    } catch (error) {
      console.error('Error canceling recording:', error);
    }
  }, [setIsRecording, setCurrentRecordingId, setRecordingDuration]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    isRecording,
    recordingDuration,
    audioLevel,
    permissionGranted,
    startRecording,
    stopRecording,
    cancelRecording,
    requestPermission,
    checkPermission,
  };
}
